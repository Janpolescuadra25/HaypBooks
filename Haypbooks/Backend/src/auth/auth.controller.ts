import { Controller, Post, Body, Res, HttpCode, HttpStatus, Inject, NotFoundException, Req, UnauthorizedException, UseGuards, Get, ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { Response } from 'express'
import { PrismaAuthService } from './prisma-auth.service'
import { VerifyOtpSchema, ResetPasswordSchema, ForgotPasswordSchema } from './schemas'
import { USER_REPOSITORY, SESSION_REPOSITORY, OTP_REPOSITORY, SECURITY_EVENT_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { LoginDto, SignupDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto'
import { ISecurityEventRepository } from '../repositories/interfaces/security-event.repository.interface'
import { MailService } from '../common/mail.service'
import { PendingSignupService } from './pending-signup.service'

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: PrismaAuthService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepo: any,
    @Inject(OTP_REPOSITORY) private readonly otpRepo: any,
    @Inject(SECURITY_EVENT_REPOSITORY) private readonly securityEventRepo: ISecurityEventRepository,
    private readonly mailService: MailService,
    private readonly pendingSignupService: PendingSignupService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const ua = req.headers['user-agent'] || ''
    const result = await this.authService.login(loginDto.email, loginDto.password, req.ip || req.connection?.remoteAddress, String(ua))

    // Determine landing redirect: if user is an accountant, suggest accountant hub; otherwise companies hub.
    try {
      if (result?.user) {
        // Respect an explicit preferredHub when present; otherwise fall back to accountant iff user.isAccountant
        const preferred = (result.user as any)?.preferredHub ? String((result.user as any).preferredHub).toLowerCase() : ''
        if (preferred) {
          if (preferred === 'owner') {
            (result as any).redirect = '/hub/companies'
          } else if (preferred === 'accountant') {
            (result as any).redirect = '/hub/accountant'
          } else {
            (result as any).redirect = result.user.isAccountant ? '/hub/accountant' : '/hub/companies'
          }
        } else {
          (result as any).redirect = result.user.isAccountant ? '/hub/accountant' : '/hub/companies'
        }
      }
    } catch (e) {
      // ignore
    }

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    // set access token cookie (short-lived) and refresh token as httpOnly cookie
    res.cookie('token', result.token, { ...cookieOptions, maxAge: 1000 * 60 * 15 }) // 15m
    if (result.refreshToken) {
      res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
    }
    res.cookie('email', result.user.email, cookieOptions)
    res.cookie('userId', result.user.id, cookieOptions)
    res.cookie('role', result.user.role, cookieOptions)
    // Reflect onboarding status to frontend via cookie so middleware/client can
    // redirect users into onboarding when needed without relying solely on JS
    if (result.user.onboardingComplete) {
      res.cookie('onboardingComplete', 'true', cookieOptions)
      // persist the user's onboarding mode so the client can act immediately
      if (result.user.onboardingMode) res.cookie('onboardingMode', result.user.onboardingMode, cookieOptions)
    } else {
      res.clearCookie('onboardingComplete')
    }

    // Set per-hub onboarding cookies (if available) and keep legacy compatibility
    try {
      if ((result.user as any).ownerOnboardingCompleted) {
        res.cookie('onboardingOwnerComplete', 'true', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
      } else {
        res.clearCookie('onboardingOwnerComplete')
      }
      if ((result.user as any).accountantOnboardingCompleted) {
        res.cookie('onboardingAccountantComplete', 'true', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
      } else {
        res.clearCookie('onboardingAccountantComplete')
      }
    } catch (e) {}

    // Set accountant flag cookie for middleware/client
    try {
      res.cookie('isAccountant', result.user.isAccountant ? 'true' : 'false', cookieOptions)
    } catch (e) {}

    return result
  }

  @Post('pre-signup')
  @HttpCode(HttpStatus.OK)
  async preSignup(@Body() body: { email: string; password: string; name?: string; role?: string; phone?: string; phoneCountry?: string }) {
    const { email, password, name, role, phone, phoneCountry } = body
    // Ensure no verified user exists with that email
    const existing = await this.userRepository.findByEmail(email)
    if (existing && existing.isEmailVerified) {
      throw new ConflictException('Email already registered')
    }

    // Hash password and store pending signup in-memory (replace with Redis in prod)
    const hashed = await bcrypt.hash(password, 10)
    const token = await this.pendingSignupService.create({ email, hashedPassword: hashed, name, role, phone, phoneCountry }, 60 * 30)

    // Start OTP to provided contact(s)
    let devOtp
    try {
      if (phone) {
        const otp = await this.authService.startOtpByPhone(phone, undefined, 10, 'VERIFY')
        if (process.env.NODE_ENV !== 'production') devOtp = (otp as any).otp
      } else {
        const otp = await this.authService.startOtp(email, undefined, 10, 'VERIFY_EMAIL')
        if (process.env.NODE_ENV !== 'production') devOtp = (otp as any).otp
        // Send email
        try {
          const html = this.mailService.buildVerifyEmailOtpHtml(name || email, (otp as any).otp)
          const text = this.mailService.buildVerifyEmailOtpText(name || email, (otp as any).otp)
          await this.mailService.sendEmail(email, `Your Haypbooks verification code`, html, text)
        } catch (e) {
          console.log('Failed to send verification email', e?.message || e)
        }
      }
    } catch (e) {
      // ignore
    }

    return { signupToken: token, otp: devOtp }
  }

  @Post('complete-signup')
  @HttpCode(HttpStatus.OK)
  async completeSignup(@Body() body: { signupToken: string; code: string; method?: 'email'|'phone' }, @Res({ passthrough: true }) res: Response) {
    const { signupToken, code, method } = body
    const pending = await this.pendingSignupService.get(signupToken)
    if (!pending) throw new NotFoundException('Signup token not found or expired')

    // Verify OTP
    let verified = false
    if (method === 'phone' && pending.phone) {
      verified = await this.authService.verifyOtpByPhone(pending.phone, code, true)
    } else {
      verified = await this.authService.verifyOtp(pending.email, code, true)
    }
    if (!verified) throw new UnauthorizedException('Invalid or expired code')

    // Ensure no other verified user exists now
    const existing = await this.userRepository.findByEmail(pending.email)
    if (existing && existing.isEmailVerified) {
      // Clean up pending to avoid stale tokens and surface conflict
      try { await this.pendingSignupService.delete(signupToken) } catch (e) {}
      throw new ConflictException('Email already registered')
    }

    // Create final user record
    const created = await this.userRepository.create({ email: pending.email, password: pending.hashedPassword, name: pending.name || null, isEmailVerified: true, role: pending.role || 'owner', phone: pending.phone || null } as any)

    // Log signup success
    try { await this.securityEventRepo.create({ userId: created.id, email: created.email, type: 'SIGNUP_SUCCESS' }) } catch (e) { /* ignore */ }

    // Set session cookies as in signup
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    const session = await this.authService.createSessionForUser(created.id)
    try { if (session) res.cookie('token', session.token, cookieOptions) } catch (e) {}
    try { res.cookie('email', created.email, cookieOptions) } catch (e) {}
    try { res.cookie('userId', created.id, cookieOptions) } catch (e) {}
    try { res.cookie('role', created.role, cookieOptions) } catch (e) {}

    // Delete pending
    await this.pendingSignupService.delete(signupToken)

    // Return created user (consistent shape)
    return { token: session?.token || null, user: { id: created.id, email: created.email, name: created.name, role: created.role, isEmailVerified: true } }
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response) {
    // Optional enforcement: prefer pre-signup flow so unverified users are not persisted to DB
    if (process.env.ENFORCE_PRE_SIGNUP === 'true') {
      return await this.preSignup({ email: signupDto.email, password: signupDto.password, name: signupDto.name, role: signupDto.role, phone: signupDto.phone })
    }

    const result = await this.authService.signup(signupDto.email, signupDto.password, signupDto.name, signupDto.role, signupDto.phone)

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    try { res.cookie('token', result.token, { ...cookieOptions, maxAge: 1000 * 60 * 15 }) } catch (e) {}
    try { if ((result as any).refreshToken) res.cookie('refreshToken', (result as any).refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }) } catch (e) {}
    try { res.cookie('email', result.user.email, cookieOptions) } catch (e) {}
    try { res.cookie('userId', result.user.id, cookieOptions) } catch (e) {}
    try { res.cookie('role', result.user.role, cookieOptions) } catch (e) {}

    return result
  }

  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  async sendVerification(@Body() body: { email: string }, @Res({ passthrough: true }) res: Response) {
    const { email } = body
    // do not reveal existence of email
    try {
      // Throttle verification sends: allow up to 5 within 60 minutes
      try {
        const recent = await this.otpRepo.countRecentByEmail(email, 60)
        if (recent >= 5) {
          console.log(`sendVerification rate limit hit for ${email}`)
          return { success: true }
        }
      } catch (e) {
        // ignore throttle errors and continue
      }

      const created = await this.authService.startOtp(email, undefined, 5, 'VERIFY_EMAIL')
      console.log(`Verification OTP for ${email}: ${created.otpCode}`)
      try {
        const html = this.mailService.buildVerifyEmailOtpHtml(email, created.otpCode)
        const text = this.mailService.buildVerifyEmailOtpText(email, created.otpCode)
        await this.mailService.sendEmail(email, `Your Haypbooks verification code`, html, text)
      } catch (e) {
        console.log('Failed to send verification email', e?.message || e)
      }

      if (process.env.NODE_ENV !== 'production') {
        // In dev, return OTP in response for testing but do NOT set a cookie or expose it in pages
        return { success: true, otp: created.otpCode }
      }
    } catch (e) {
      // ignore
    }
    return { success: true }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    // If a refresh token cookie exists, remove the session from DB
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) {
      try {
        const session = await this.sessionRepo.findByRefreshToken(refreshToken)
        if (session) await this.sessionRepo.delete(session.id)
      } catch (e) {
        // ignore
      }
    }

    res.clearCookie('token')
    res.clearCookie('refreshToken')
    res.clearCookie('email')
    res.clearCookie('userId')
    res.clearCookie('role')
    res.clearCookie('onboardingComplete')

    return { success: true }
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async listSessions(@Req() req: any) {
    const userId = req.user?.userId
    if (!userId) return []
    const includeRevoked = req.query?.includeRevoked === 'true'
    const sessions = await this.sessionRepo.findByUserId(userId, includeRevoked)
    return sessions
  }

  @Post('sessions/revoke')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Req() req: any, @Body() body: { sessionId?: string; refreshToken?: string }) {
    const userId = req.user?.userId
    if (!userId) throw new UnauthorizedException()

    const { sessionId, refreshToken } = body
    if (sessionId) {
      // ensure session belongs to user
      const sessions = await this.sessionRepo.findByUserId(userId)
      const match = sessions.find((s: any) => s.id === sessionId)
      if (!match) throw new UnauthorizedException()
      await this.sessionRepo.delete(sessionId)
      return { success: true }
    }
    if (refreshToken) {
      const session = await this.sessionRepo.findByRefreshToken(refreshToken)
      if (!session || session.userId !== userId) throw new UnauthorizedException()
      await this.sessionRepo.delete(session.id)
      return { success: true }
    }
    throw new NotFoundException('sessionId or refreshToken required')
  }

  @Post('sessions/revoke-all')
  @UseGuards(JwtAuthGuard)
  async revokeAllSessions(@Req() req: any) {
    const userId = req.user?.userId
    if (!userId) throw new UnauthorizedException()
    const count = await this.sessionRepo.deleteByUserId(userId)
    return { success: true, deleted: count }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) throw new UnauthorizedException()
    const result = await this.authService.refresh(refreshToken)
    if (!result) throw new UnauthorizedException()

    // set new refreshed cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
    res.cookie('token', result.token, { ...cookieOptions, maxAge: 1000 * 60 * 15 })
    res.cookie('refreshToken', result.refreshToken, cookieOptions)

    return { token: result.token, user: result.user }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    // extra runtime validation using zod as a defensive layer
    const parsed = ForgotPasswordSchema.safeParse(body)
    if (!parsed.success) return { success: true }
    const { email } = parsed.data
    // Find user and create reset token
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      // Do not reveal existence of user
      return { success: true }
    }

    // Throttle forgot-password requests: allow 5 per 60 minutes per email
    try {
      const recent = await this.otpRepo.countRecentByEmail(email, 60)
      if (recent >= 5) {
        console.log(`Rate limit hit for forgot-password: ${email}`)
        return { success: true }
      }
    } catch (e) {
      // ignore errors and continue
    }

    // generate 6-digit numeric OTP and save to Otp table via authService
    try {
      const created = await this.authService.startOtp(email, undefined, 5)
      // In production: send email with OTP. For dev, log it so we can test.
      console.log(`Password reset OTP for ${email}: ${created.otpCode} (expires ${created.expiresAt})`)
      if (process.env.NODE_ENV !== 'production') {
        // In development return the OTP so automated testing / manual testing is convenient
        return { success: true, otp: created.otpCode }
      }
    } catch (e) {
      // ignore creating failure; don't reveal errors to client
      console.log('Failed to create OTP for forgot-password', e?.message || e)
    }

    return { success: true }
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const parsed = VerifyOtpSchema.safeParse(body)
    if (!parsed.success) return { success: false }
    // Debug logging for e2e — avoid logging raw phone to reduce PII exposure
    // eslint-disable-next-line no-console
    console.log('[auth] verify-otp attempt', { email: parsed.data.email, otpCode: parsed.data.otpCode })

    // Determine whether this is an email or phone verification
    let ok = false
    if (parsed.data.email) {
      ok = await this.authService.verifyOtp(parsed.data.email, parsed.data.otpCode, false)
      // eslint-disable-next-line no-console
      console.log('[auth] verify-otp result (email)', { email: parsed.data.email, ok })
      if (!ok) return { success: false }

      // If this OTP was for email verification, explicitly consume it now; for RESET flows leave it for the reset endpoint to consume
      try {
        const latest = await this.otpRepo.findLatestByEmail(parsed.data.email)
        // eslint-disable-next-line no-console
        console.log('[auth] verify-otp latest row', { email: parsed.data.email, latest: latest ? { id: latest.id, otpCode: latest.otpCode, purpose: latest.purpose } : null })
        if (latest && (latest as any).purpose === 'VERIFY' || (latest as any).purpose === 'VERIFY_EMAIL') {
          try { await this.otpRepo.delete(latest.id) } catch (e) {}
        }
      } catch (e) {}

      // Mark user as email verified
      try {
        const user = await this.userRepository.findByEmail(parsed.data.email)
        if (user && !user.isEmailVerified) {
          await this.userRepository.update(user.id, { isEmailVerified: true })
        }
      } catch (e) {
        // Don't surface this to client; verification is already successful
        console.log('Failed to update email verified flag', e?.message || e)
      }

      return { success: true }
    }

    if (parsed.data.phone) {
      const normalized = require('../utils/phone.util').normalizePhoneOrThrow(parsed.data.phone)
      ok = await this.authService.verifyOtpByPhone(normalized, parsed.data.otpCode, false)
      const maskedPhone = require('../utils/phone.util').maskPhoneForDisplay(normalized)
      // eslint-disable-next-line no-console
      console.log('[auth] verify-otp result (phone)', { phone: maskedPhone, ok })
      if (!ok) return { success: false }

      // For phone flows, consume any matching MFA row
      try {
        const latest = await this.otpRepo.findLatestByPhone(normalized)
        if (latest && (latest as any).purpose === 'MFA') {
          try { await this.otpRepo.delete(latest.id) } catch (e) {}
        }
      } catch (e) {}

      // Mark user as phone verified (persist flag/timestamp)
      try {
        const user = this.userRepository.findByPhone ? await this.userRepository.findByPhone(normalized) : null
        if (user && !(user as any).isPhoneVerified) {
          await this.userRepository.update(user.id, { isPhoneVerified: true, phone: normalized, phoneVerifiedAt: new Date() })
        }
      } catch (e) {
        // Don't surface to client; verification succeeded already
        console.log('Failed to update phone verified flag', e?.message || e)
      }

      return { success: true }
    }

    return { success: false }
  }

  @Get('verify-email')
  async verifyEmail(@Req() req: any, @Res() res: Response) {
    const email = String(req.query?.email || '')
    const otp = String(req.query?.otp || '')
    if (!email || !otp) return res.redirect((process.env.FRONTEND_URL || 'http://localhost:3000') + '/verify-email?status=error')

    try {
      const ok = await this.authService.verifyOtp(email, otp, true)
      if (!ok) {
        return res.redirect((process.env.FRONTEND_URL || 'http://localhost:3000') + '/verify-email?status=invalid')
      }

      // mark user as email verified
      let user: any = undefined
      try {
        user = await this.userRepository.findByEmail(email)
        if (user && !user.isEmailVerified) {
          await this.userRepository.update(user.id, { isEmailVerified: true })
        }

        // Optionally create a session and set cookies so users are logged in after verification
        if (process.env.ENABLE_AUTO_VERIFY_LOGIN === 'true' && user) {
          try {
            const session = await this.authService.createSessionForUser(user.id, req.ip || req.connection?.remoteAddress, String(req.headers['user-agent'] || ''))
            if (session && session.token) {
              const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                maxAge: 7 * 24 * 60 * 60 * 1000,
              }
              res.cookie('token', session.token, { ...cookieOptions, maxAge: 1000 * 60 * 15 })
              if ((session as any).refreshToken) res.cookie('refreshToken', (session as any).refreshToken, cookieOptions)
              res.cookie('email', user.email, cookieOptions)
              res.cookie('userId', user.id, cookieOptions)
              res.cookie('role', user.role, cookieOptions)
              try { res.cookie('isAccountant', user.isAccountant ? 'true' : 'false', cookieOptions) } catch (e) {}
            }
          } catch (e) {
            // Do not block verification when session creation fails
            console.log('Failed to create session on email verification', e?.message || e)
          }
        }
      } catch (e) {}

      // Redirect to frontend success page and include the user's name + email for friendly messaging
      const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000')
      try {
        const emailEsc = user ? encodeURIComponent(user.email) : ''
        let nameParam = ''
        if (user) {
          const parts: string[] = []
          if (user.firstName && user.firstName.trim()) parts.push(encodeURIComponent(user.firstName.trim()))
          if (user.lastName && user.lastName.trim()) parts.push(encodeURIComponent(user.lastName.trim()))
          if (parts.length) nameParam = `&name=${parts.join('%20')}`
        }
        const emailParam = emailEsc ? `&email=${emailEsc}` : ''
        return res.redirect(`${frontend}/verify-email?status=success${nameParam}${emailParam}`)
      } catch (e) {
        return res.redirect(frontend + '/verify-email?status=success')
      }
    } catch (e) {
      return res.redirect((process.env.FRONTEND_URL || 'http://localhost:3000') + '/verify-email?status=error')
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    const parsed = ResetPasswordSchema.safeParse(body)
    if (!parsed.success) throw new NotFoundException('Invalid reset payload')
    const { email, otpCode, password, token } = parsed.data
    
    // Validate password strength
    if (!password || password.length < 8) {
      throw new NotFoundException('Password must be at least 8 characters')
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new NotFoundException('Password must include uppercase letter and number')
    }
    
    // support token reset flow in future
    if (!token && (!email || !otpCode)) throw new NotFoundException('Missing token or email/otp')
    const user = await this.userRepository.findByEmail(email!)
    if (!user) return { success: true } // Don't reveal user existence

    // verify and consume the OTP for password reset so it cannot be reused
    const valid = await this.authService.verifyOtp(email!, otpCode!, true)
    if (!valid) throw new NotFoundException('OTP invalid or expired')

    // Hash and update password
    const hashed = await require('bcrypt').hash(password, 10)
    await this.userRepository.update(user.id, { password: hashed })
    return { success: true }
  }

  @Get('security-events')
  @UseGuards(JwtAuthGuard)
  async getSecurityEvents(@Req() req: any) {
    const userId = req.user?.userId
    if (!userId) throw new UnauthorizedException()
    
    const limit = parseInt(req.query?.limit) || 50
    const events = await this.securityEventRepo.findByUserId(userId, limit)
    
    return events.map((e: any) => ({
      id: e.id,
      type: e.type,
      ipAddress: e.ipAddress,
      userAgent: e.userAgent,
      createdAt: e.createdAt,
    }))
  }
}
