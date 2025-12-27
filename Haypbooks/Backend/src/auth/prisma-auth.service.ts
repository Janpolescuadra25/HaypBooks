import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { USER_REPOSITORY, SESSION_REPOSITORY, OTP_REPOSITORY, SECURITY_EVENT_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { ISessionRepository } from '../repositories/interfaces/session.repository.interface'
import { IOtpRepository } from '../repositories/interfaces/otp.repository.interface'
import { ISecurityEventRepository } from '../repositories/interfaces/security-event.repository.interface'

@Injectable()
export class PrismaAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepo: ISessionRepository,
    @Inject(OTP_REPOSITORY) private readonly otpRepo: IOtpRepository,
    @Inject(SECURITY_EVENT_REPOSITORY) private readonly securityEventRepo: ISecurityEventRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string, role?: string, phone?: string) {
    const existing = await this.userRepo.findByEmail(email)
    if (existing) {
      // Log failed signup attempt
      await this.logSecurityEvent({ email, type: 'SIGNUP_FAILED_DUPLICATE' })
      throw new ConflictException('Email already registered')
    }

    const hashed = await bcrypt.hash(password, 10)
    const isAccountant = role === 'accountant' || role === 'both'
    const preferredHub = isAccountant ? 'ACCOUNTANT' : 'OWNER'
    // Normalize phone if provided
    let normalizedPhone: string | undefined = undefined
    let phoneHmac: string | undefined = undefined
    if (phone) {
      try {
        normalizedPhone = require('../utils/phone.util').normalizePhoneOrThrow(phone)
        try { phoneHmac = require('../utils/hmac.util').hmacPhone(normalizedPhone) } catch (e) { phoneHmac = undefined }
      } catch (e) { throw e }
    }
    const user = await this.userRepo.create({ email, password: hashed, name, isEmailVerified: false, isAccountant, preferredHub, phone: normalizedPhone, phoneHmac } as any)

    // Log successful signup
    await this.logSecurityEvent({ userId: user.id, email, type: 'SIGNUP_SUCCESS' })

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role })
    
    // Return consistent user object structure
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAccountant: user.isAccountant ?? false,
      onboardingCompleted: user.onboardingComplete ?? false,
      onboardingComplete: user.onboardingComplete ?? false,
      onboardingMode: user.onboardingMode || 'full',
      isEmailVerified: user.isEmailVerified ?? false,
      // Per-hub flags
      ownerOnboardingCompleted: (user as any).ownerOnboardingComplete ?? false,
      accountantOnboardingCompleted: (user as any).accountantOnboardingComplete ?? false,
      preferredHub: user.preferredHub ?? null,
      // If the user has both roles and hasn't chosen a preferred hub, the frontend should show the Hub Selection modal
      requiresHubSelection: !!(user.isAccountant && (user.role !== 'accountant') && !user.preferredHub),
    }
    
    return { token, user: userResponse }
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findByEmail(email)
    
    // Check for rate limiting - max 5 failed attempts per email in 15 minutes
    if (user) {
      try {
        const recentFailures = await this.securityEventRepo.countRecentByEmail(email, 15)
        if (recentFailures >= 5) {
          await this.logSecurityEvent({ userId: user.id, email, type: 'LOGIN_RATE_LIMITED', ipAddress, userAgent })
          throw new UnauthorizedException('Too many failed login attempts. Please try again later.')
        }
      } catch (e) {
        // Continue if rate limit check fails
      }
    }

    if (!user) {
      // Log failed attempt for non-existent user
      await this.logSecurityEvent({ email, type: 'LOGIN_FAILED_USER_NOT_FOUND', ipAddress, userAgent })
      throw new UnauthorizedException('Invalid credentials')
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      // Log failed password attempt
      await this.logSecurityEvent({ userId: user.id, email, type: 'LOGIN_FAILED_INVALID_PASSWORD', ipAddress, userAgent })
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check if email is verified (optional enforcement)
    if (!user.isEmailVerified && process.env.ENFORCE_EMAIL_VERIFICATION === 'true') {
      await this.logSecurityEvent({ userId: user.id, email, type: 'LOGIN_FAILED_UNVERIFIED_EMAIL', ipAddress, userAgent })
      throw new UnauthorizedException('Please verify your email before logging in')
    }

    // Log successful login
    await this.logSecurityEvent({ userId: user.id, email, type: 'LOGIN_SUCCESS', ipAddress, userAgent })

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })
    // create refresh session (longer lived)
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.sessionRepo.create({ userId: user.id, refreshToken, expiresAt, ipAddress, userAgent, lastUsedAt: new Date() })

    // Return consistent user object structure for frontend
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAccountant: user.isAccountant ?? false,
      onboardingCompleted: user.onboardingComplete ?? false,
      onboardingComplete: user.onboardingComplete ?? false, // Both formats for compatibility
      onboardingMode: user.onboardingMode || 'full',
      isEmailVerified: user.isEmailVerified ?? false,
      ownerOnboardingCompleted: (user as any).ownerOnboardingComplete ?? false,
      accountantOnboardingCompleted: (user as any).accountantOnboardingComplete ?? false,
      preferredHub: user.preferredHub ?? null,
      requiresHubSelection: !!(user.isAccountant && (user.role !== 'accountant') && !user.preferredHub),
    }

    // Developer convenience: in non-production environments, if a user is not email-verified,
    // surface a flag so the frontend will present the verification UI immediately after login.
    // This is strictly dev/test-only and will not run in production.
    const devMfa = (process.env.NODE_ENV || 'development') !== 'production' && !user.isEmailVerified

    if (devMfa) {
      return { token, refreshToken, user: userResponse, mfaRequired: true }
    }

    return { token, refreshToken, user: userResponse }
  }

  async createSessionForUser(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findById(userId)
    if (!user) return null

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    try {
      await this.sessionRepo.create({ userId: user.id, refreshToken, expiresAt, ipAddress, userAgent, lastUsedAt: new Date() })
    } catch (e) {
      // ignore failures creating session to avoid blocking verification flow
      console.error('Failed to create session for user', e?.message || e)
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAccountant: user.isAccountant ?? false,
      onboardingCompleted: user.onboardingComplete ?? false,
      onboardingComplete: user.onboardingComplete ?? false,
      onboardingMode: user.onboardingMode || 'full',
      isEmailVerified: user.isEmailVerified ?? false,
      ownerOnboardingCompleted: (user as any).ownerOnboardingComplete ?? false,
      accountantOnboardingCompleted: (user as any).accountantOnboardingComplete ?? false,
      preferredHub: user.preferredHub ?? null,
      requiresHubSelection: !!(user.isAccountant && (user.role !== 'accountant') && !user.preferredHub),
    }

    return { token, refreshToken, user: userResponse }
  }

  async refresh(refreshToken: string) {
    // find session
    const session = await this.sessionRepo.findByRefreshToken(refreshToken)
    if (!session) return null
    if ((new Date(session.expiresAt)).getTime() < Date.now() || session.revoked) {
      // expired
      return null
    }

    // sign a fresh access token
    const user = await this.userRepo.findById(session.userId)
    if (!user) return null
    
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' })
    // Optional: rotate refresh token
    const newRefresh = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    // delete old session and create new one
    try {
      await this.sessionRepo.delete(session.id)
    } catch {}
    await this.sessionRepo.create({ userId: user.id, refreshToken: newRefresh, expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent, lastUsedAt: new Date() })

    // Return consistent user structure
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAccountant: user.isAccountant ?? false,
      onboardingCompleted: user.onboardingComplete ?? false,
      onboardingComplete: user.onboardingComplete ?? false,
      onboardingMode: user.onboardingMode || 'full',
      isEmailVerified: user.isEmailVerified ?? false,
      ownerOnboardingCompleted: (user as any).ownerOnboardingComplete ?? false,
      accountantOnboardingCompleted: (user as any).accountantOnboardingComplete ?? false,
      preferredHub: user.preferredHub ?? null,
      requiresHubSelection: !!(user.isAccountant && (user.role !== 'accountant') && !user.preferredHub),
    }

    return { token, refreshToken: newRefresh, user: userResponse }
  }

  async startOtp(email: string, otpCode?: string, ttlMinutes = 5, purpose: string = 'RESET') {
    // generate 6-digit numeric otp if none supplied
    const code = otpCode || String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
    // attempts default 0
    const created = await this.otpRepo.create({ email, otpCode: code, expiresAt, purpose })
    return created
  }

  async startOtpByPhone(phone: string, otpCode?: string, ttlMinutes = 5, purpose: string = 'RESET') {
    const code = otpCode || String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)
    // Normalize phone before creating OTP
    const normalized = require('../utils/phone.util').normalizePhoneOrThrow(phone)
    const created = await this.otpRepo.create({ phone: normalized, otpCode: code, expiresAt, purpose })
    return created
  }

  async verifyOtp(email: string, otpCode: string, consume: boolean = false) {
    const row = await this.otpRepo.findLatestByEmail(email)
    if (!row) return false
    const expiryTs = typeof row.expiresAt === 'number' ? row.expiresAt : (row.expiresAt instanceof Date ? row.expiresAt.getTime() : Number(row.expiresAt))
    if (expiryTs < Date.now()) return false
    if (row.attempts >= 5) return false
    if (row.otpCode !== otpCode) {
      await this.otpRepo.incrementAttempts(row.id)
      return false
    }

    // On successful verification: decide whether to consume (delete) OTP.
    // For email verification (purpose === 'VERIFY') we delete it immediately.
    // For password reset flows we'll only delete when explicitly asked to consume (so reset can still use it).
    try {
      if (consume || (row as any).purpose === 'VERIFY_EMAIL' || (row as any).purpose === 'VERIFY') {
        await this.otpRepo.delete(row.id)
      }
    } catch (e) {}

    // If this OTP was used to VERIFY an email, mark user as verified
    try {
      if ((row as any).purpose === 'VERIFY_EMAIL' || (row as any).purpose === 'VERIFY') {
        const user = await this.userRepo.findByEmail(email)
        if (user) await this.userRepo.update(user.id, { isEmailVerified: true })
      }
    } catch (e) {
      // ignore errors here
    }

    return true
  }

  async verifyOtpByPhone(phone: string, otpCode: string, consume: boolean = false) {
    const row = await this.otpRepo.findLatestByPhone(phone)
    if (!row) return false
    const expiryTs = typeof row.expiresAt === 'number' ? row.expiresAt : (row.expiresAt instanceof Date ? row.expiresAt.getTime() : Number(row.expiresAt))
    if (expiryTs < Date.now()) return false
    if (row.attempts >= 5) return false
    if (row.otpCode !== otpCode) {
      await this.otpRepo.incrementAttempts(row.id)
      return false
    }

    try {
      if (consume || (row as any).purpose === 'VERIFY_EMAIL' || (row as any).purpose === 'VERIFY') {
        await this.otpRepo.delete(row.id)
      }
    } catch (e) {}

    // No automatic user flags updated for phone-based OTPs
    return true
  }

  /**
   * Log security events - non-blocking
   */
  private async logSecurityEvent(data: {
    userId?: string
    email?: string
    type: string
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      await this.securityEventRepo.create(data)
    } catch (e) {
      // Log error but don't throw - security events shouldn't block auth flow
      console.error('Failed to log security event:', e?.message)
    }
  }
}
