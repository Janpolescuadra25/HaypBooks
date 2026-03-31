import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from '../utils/bcrypt-fallback'
import { USER_REPOSITORY, SESSION_REPOSITORY, OTP_REPOSITORY, SECURITY_EVENT_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { ISessionRepository } from '../repositories/interfaces/session.repository.interface'
import { IOtpRepository } from '../repositories/interfaces/otp.repository.interface'
import { ISecurityEventRepository } from '../repositories/interfaces/security-event.repository.interface'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class PrismaAuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepo: ISessionRepository,
    @Inject(OTP_REPOSITORY) private readonly otpRepo: IOtpRepository,
    @Inject(SECURITY_EVENT_REPOSITORY) private readonly securityEventRepo: ISecurityEventRepository,
    private readonly jwtService: JwtService,
    private readonly prisma?: PrismaService,
  ) { }

  async signup(email: string, password: string, name?: string, role?: string, phone?: string) {
    const existing = await this.userRepo.findByEmail(email)
    if (existing) {
      // Block duplicate signups for any existing email (verified or not) to avoid
      // confusing repeated signup flows and ensure tests/clients see consistent behavior.
      await this.logSecurityEvent({ email, type: 'SIGNUP_FAILED_DUPLICATE' })
      throw new ConflictException('Email already registered')
    }

    // Defensive validation: require phone at signup
    if (!phone) throw new BadRequestException('Phone number is required')

    const hashed = await bcrypt.hash(password, 10)
    const isAccountant = role === 'accountant' || role === 'both'
    const preferredHub = isAccountant ? 'ACCOUNTANT' : 'OWNER'
    // Normalize phone
    let normalizedPhone: string | undefined = undefined
    let phoneHmac: string | undefined = undefined
    try {
      normalizedPhone = require('../utils/phone.util').normalizePhoneOrThrow(phone)
      try { phoneHmac = require('../utils/hmac.util').hmacPhone(normalizedPhone) } catch (e) { phoneHmac = undefined }
    } catch (e) { throw e }
    const user = await this.userRepo.create({ email, password: hashed, name, isEmailVerified: false, isAccountant, preferredHub, phone: normalizedPhone, phoneHmac } as any)

    // Log successful signup
    await this.logSecurityEvent({ userId: user.id, email, type: 'SIGNUP_SUCCESS' })

    // Extended to 2h to prevent session expiry during onboarding flow
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '2h' })

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


  /** Parse a human-readable device label from User-Agent string */
  private parseDeviceName(ua?: string): string {
    if (!ua) return 'Unknown Device'
    if (/mobile|android|iphone|ipad/i.test(ua)) return 'Mobile Browser'
    if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) return 'Chrome'
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
    if (/firefox/i.test(ua)) return 'Firefox'
    if (/edge/i.test(ua)) return 'Edge'
    return 'Browser'
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findByEmail(email)

    // Check for rate limiting - max 5 failed attempts per email in 15 minutes
    if (user) {
      let recentFailures = 0
      try {
        recentFailures = await this.securityEventRepo.countRecentByEmail(email, 15)
      } catch (e) {
        // Continue if rate limit check fails
      }

      if (recentFailures >= 5) {
        await this.logSecurityEvent({ userId: user.id, email, type: 'LOGIN_RATE_LIMITED', ipAddress, userAgent })
        throw new UnauthorizedException('Too many failed login attempts. Please try again later.')
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

    // Enforce verification: require at least ONE verified contact method.
    // If a phone exists, either email verification OR phone verification is sufficient.
    // If no phone exists, email verification is required.
    const hasPhone = !!(user as any).phone
    const emailVerified = !!user.isEmailVerified
    const phoneVerified = !!(user as any).isPhoneVerified
    const verifiedOk = hasPhone ? (emailVerified || phoneVerified) : emailVerified

    // Debug logging to help diagnose verification issues
    console.log('[auth:login] Verification check:', {
      email,
      userId: user.id,
      hasPhone,
      emailVerified,
      phoneVerified,
      verifiedOk,
      policy: hasPhone ? 'OR (email OR phone)' : 'email required'
    })

    if (!verifiedOk) {
      await this.logSecurityEvent({ userId: user.id, email, type: 'LOGIN_FAILED_UNVERIFIED_EMAIL', ipAddress, userAgent })
      throw new UnauthorizedException('Please verify your account before logging in')
    }

    // Log successful login
    await this.logSecurityEvent({ userId: user.id, email, type: 'LOGIN_SUCCESS', ipAddress, userAgent })

    // Extended to 2h to prevent session expiry during onboarding flow
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '2h' })
    // create refresh session (longer lived)
    const tokenFamily = randomUUID()
    const refreshToken = this.jwtService.sign({ sub: user.id, nonce: randomUUID(), family: tokenFamily }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.sessionRepo.create({
      userId: user.id, refreshToken, expiresAt, ipAddress, userAgent, lastUsedAt: new Date(),
      deviceName: this.parseDeviceName(userAgent), tokenFamily,
    } as any)

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
      await this.activateInvitedWorkspaceUser(user.id).catch(() => {})
      return { token, refreshToken, user: userResponse, mfaRequired: true }
    }

    await this.activateInvitedWorkspaceUser(user.id).catch(() => {})

    return { token, refreshToken, user: userResponse }
  }

  async activateInvitedWorkspaceUser(userId: string) {
    if (!userId || !this.prisma) return 0
    const updated = await this.prisma.workspaceUser.updateMany({
      where: { userId, status: 'INVITED' },
      data: { status: 'ACTIVE', joinedAt: new Date() },
    })
    return updated.count
  }

  async createSessionForUser(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepo.findById(userId)
    if (!user) return null

    // Extended to 2h to prevent session expiry during onboarding flow
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '2h' })
    const tokenFamily = randomUUID()
    const refreshToken = this.jwtService.sign({ sub: user.id, nonce: randomUUID(), family: tokenFamily }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    try {
      await this.sessionRepo.create({
        userId: user.id, refreshToken, expiresAt, ipAddress, userAgent, lastUsedAt: new Date(),
        deviceName: this.parseDeviceName(userAgent), tokenFamily,
      } as any)
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
    try { console.log(`[auth:refresh] incoming token prefix=${String(refreshToken || '').slice(0, 12)}`) } catch (e) { }
    // find session
    const session = await this.sessionRepo.findByRefreshToken(refreshToken)
    if (!session) {
      try { console.log(`[auth:refresh] no session found for token prefix=${String(refreshToken || '').slice(0, 12)}`) } catch (e) { }
      return null
    }
    const expired = (new Date(session.expiresAt)).getTime() < Date.now()
    if (expired || session.revoked) {
      try { console.log(`[auth:refresh] session invalid: expired=${expired} revoked=${session.revoked} expiresAt=${session.expiresAt}`) } catch (e) { }
      return null
    }

    // sign a fresh access token
    const user = await this.userRepo.findById(session.userId)
    if (!user) {
      try { console.log(`[auth:refresh] no user found for session.userId=${session.userId}`) } catch (e) { }
      return null
    }

    // Extended to 2h to prevent session expiry during onboarding flow
    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '2h' })
    // Optional: rotate refresh token
    // Inherit tokenFamily from old session for replay-attack detection
    const tokenFamily = (session as any).tokenFamily ?? randomUUID()
    const newRefresh = this.jwtService.sign({ sub: user.id, nonce: randomUUID(), family: tokenFamily }, { expiresIn: '7d' })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    // Revoke old session with reason, create new one in the same family
    try {
      await this.sessionRepo.update(session.id, { revoked: true, revokedReason: 'REFRESHED' } as any)
    } catch { }
    await this.sessionRepo.create({
      userId: user.id, refreshToken: newRefresh, expiresAt,
      ipAddress: session.ipAddress, userAgent: session.userAgent, lastUsedAt: new Date(),
      deviceName: (session as any).deviceName ?? this.parseDeviceName(session.userAgent ?? ''),
      tokenFamily,
    } as any)

    try { console.log(`[auth:refresh] success for user=${user.id} newRefreshPrefix=${String(newRefresh).slice(0, 12)}`) } catch (e) { }

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
    // For password reset flows we'll only delete when explicitly asked to consume (so reset can still use it).
    try {
      if (consume || (row as any).purpose === 'VERIFY_EMAIL' || (row as any).purpose === 'MFA') {
        await this.otpRepo.delete(row.id)
      }
    } catch (e) { }

    // If this OTP was used to VERIFY an email, mark user as verified
    try {
      if ((row as any).purpose === 'VERIFY_EMAIL') {
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
      if (consume || (row as any).purpose === 'VERIFY_EMAIL' || (row as any).purpose === 'MFA') {
        await this.otpRepo.delete(row.id)
      }
    } catch (e) { }

    // No automatic user flags updated for phone-based OTPs
    return true
  }

  // ─── Session Dashboard ────────────────────────────────────────────────────

  async getSessions(userId: string) {
    const sessions = await this.sessionRepo.findByUserId(userId)
    return sessions
      .filter((s: any) => !s.revoked && new Date(s.expiresAt) > new Date())
      .map((s: any) => ({
        id: s.id,
        deviceName: s.deviceName ?? 'Unknown Device',
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        lastUsedAt: s.lastUsedAt,
        expiresAt: s.expiresAt,
        activeCompanyId: s.activeCompanyId ?? null,
      }))
  }

  async revokeSession(requestingUserId: string, sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId)
    if (!session) throw new NotFoundException('Session not found')
    if (session.userId !== requestingUserId) throw new ForbiddenException('Not your session')
    await this.sessionRepo.update(sessionId, { revoked: true, revokedReason: 'USER_REVOKED' } as any)
    await this.logSecurityEvent({ userId: requestingUserId, type: 'SESSION_REVOKED' })
    return { success: true, sessionId }
  }

  async updateSessionCompany(sessionId: string, activeCompanyId: string) {
    try {
      await this.sessionRepo.update(sessionId, { activeCompanyId } as any)
    } catch (e) {
      // non-blocking — don't fail request if session context update fails
    }
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
