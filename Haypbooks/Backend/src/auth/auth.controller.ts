import { Controller, Post, Body, Res, HttpCode, HttpStatus, Inject, NotFoundException, Req, UnauthorizedException, UseGuards, Get, ConflictException } from '@nestjs/common'
import * as bcrypt from '../utils/bcrypt-fallback'
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

function normalizeEmail(email: string): string {
  return String(email || '').trim().toLowerCase()
}

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
    const result = await this.authService.login(normalizeEmail(loginDto.email), loginDto.password, req.ip || req.connection?.remoteAddress, String(ua))

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
  async preSignup(@Body() body: { email: string; password: string; name?: string; role?: string; phone?: string; phoneCountry?: string; companyName?: string; firmName?: string }) {
    const { password, name, role, phone, phoneCountry, companyName, firmName } = body
    const email = normalizeEmail(body.email)
    // Ensure no verified user exists with that email
    const existing = await this.userRepository.findByEmail(email)
    if (existing && existing.isEmailVerified) {
      throw new ConflictException('Email already registered')
    }

    // Hash password and store pending signup in-memory (replace with Redis in prod)
    const hashed = await bcrypt.hash(password, 10)
    const token = await this.pendingSignupService.create({
      email,
      hashedPassword: hashed,
      name,
      role,
      phone,
      phoneCountry,
      companyName: companyName || undefined,
      firmName: firmName || undefined,
      emailOtpVerified: false,
      phoneOtpVerified: false,
    }, 60 * 30)

    // Start OTP to provided contact(s)
    let devOtpEmail: string | undefined
    let devOtpPhone: string | undefined
    try {
      // Always start email OTP and normalize returned shape (Prisma returns `otpCode`)
      const emailOtp = await this.authService.startOtp(email, undefined, 10, 'VERIFY_EMAIL')
      if (process.env.NODE_ENV !== 'production') devOtpEmail = (emailOtp as any).otpCode || (emailOtp as any).otp
      try {
        const html = this.mailService.buildVerifyEmailOtpHtml(name || email, (emailOtp as any).otpCode || (emailOtp as any).otp)
        const text = this.mailService.buildVerifyEmailOtpText(name || email, (emailOtp as any).otpCode || (emailOtp as any).otp)
        await this.mailService.sendEmail(email, `Your Haypbooks verification code`, html, text)
      } catch (e) {
        console.log('Failed to send verification email', e?.message || e)
      }

      // If a phone number exists, also start phone OTP (keep phone OTP creation for dev/test compatibility)
      if (phone) {
        const phoneOtp = await this.authService.startOtpByPhone(phone, undefined, 10, 'MFA')
        if (process.env.NODE_ENV !== 'production') devOtpPhone = (phoneOtp as any).otpCode || (phoneOtp as any).otp
      }
    } catch (e) {
      // ignore
    }

    // Back-compat: return `otp` as the email OTP (first step)
    return { signupToken: token, otp: devOtpEmail, otpEmail: devOtpEmail, otpPhone: devOtpPhone }
  }

  @Post('complete-signup')
  @HttpCode(HttpStatus.OK)
  async completeSignup(@Body() body: { signupToken: string; code: string; method?: 'email'|'phone' }, @Res({ passthrough: true }) res: Response) {
    const { signupToken, code, method } = body
    const pending = await this.pendingSignupService.get(signupToken)
    if (!pending) throw new NotFoundException('Signup token not found or expired')

    const desiredMethod: 'email' | 'phone' = method === 'phone' ? 'phone' : 'email'

    // Verify OTP
    let verified = false
    if (desiredMethod === 'phone') {
      if (!pending.phone) throw new UnauthorizedException('Phone verification not available for this signup')
      verified = await this.authService.verifyOtpByPhone(pending.phone, code, true)
    } else {
      verified = await this.authService.verifyOtp(normalizeEmail(pending.email), code, true)
    }
    if (!verified) throw new UnauthorizedException('Invalid or expired code')

    // Mark pending as verified for this method (do not create DB user until all required methods are verified)
    const now = Date.now()
    const updated = await this.pendingSignupService.update(signupToken, desiredMethod === 'phone'
      ? { phoneOtpVerified: true, phoneOtpVerifiedAt: now }
      : { emailOtpVerified: true, emailOtpVerifiedAt: now }
    )
    const pendingAfter = updated || await this.pendingSignupService.get(signupToken)
    if (!pendingAfter) throw new NotFoundException('Signup token not found or expired')

    const hasPhone = !!pendingAfter.phone
    const emailOk = !!pendingAfter.emailOtpVerified
    const phoneOk = !!pendingAfter.phoneOtpVerified

    // Policy: if a phone exists, user may verify EITHER email OR phone to complete signup.
    // If no phone exists, email verification is required.
    const canComplete = hasPhone ? (emailOk || phoneOk) : emailOk
    if (!canComplete) {
      const nextMethod: 'email' | 'phone' = hasPhone ? (desiredMethod === 'email' ? 'phone' : 'email') : 'email'
      return {
        success: true,
        signupToken,
        verified: { email: emailOk, phone: hasPhone ? phoneOk : false },
        nextMethod,
        token: null,
      }
    }

    const normalizedEmail = normalizeEmail(pendingAfter.email)

    // If a verified user exists, block and clean up pending.
    // If an unverified user exists (legacy direct-signup), upgrade it instead of creating a duplicate.
    const existing = await this.userRepository.findByEmail(normalizedEmail)
    if (existing && existing.isEmailVerified) {
      try { await this.pendingSignupService.delete(signupToken) } catch (e) {}
      throw new ConflictException('Email already registered')
    }

    const role = pendingAfter.role || 'owner'
    const isAccountant = role === 'accountant' || role === 'both'
    const preferredHub = isAccountant ? 'ACCOUNTANT' : 'OWNER'

    // Normalize phone if present (avoid storing unnormalized values)
    let normalizedPhone: string | null = null
    let phoneHmac: string | undefined = undefined
    if (pendingAfter.phone) {
      try {
        normalizedPhone = require('../utils/phone.util').normalizePhoneOrThrow(pendingAfter.phone)
        try { phoneHmac = require('../utils/hmac.util').hmacPhone(normalizedPhone) } catch (e) { phoneHmac = undefined }
      } catch (e) {
        // If phone normalization fails, still allow completion based on email OTP verification.
        normalizedPhone = pendingAfter.phone
      }
    }

    let created: any
    // Determine verification flags to persist.
    const finalEmailVerified = emailOk
    const finalPhoneVerified = hasPhone ? phoneOk : false

    console.log('[complete-signup] Creating user with verification flags:', {
      email: normalizedEmail,
      hasPhone,
      emailOk,
      phoneOk,
      finalEmailVerified,
      finalPhoneVerified,
      willSetPhoneVerified: !!(normalizedPhone && finalPhoneVerified)
    })

    if (existing && !existing.isEmailVerified) {
      created = await this.userRepository.update(existing.id, {
        email: normalizedEmail,
        password: pendingAfter.hashedPassword,
        name: pendingAfter.name || null,
        isEmailVerified: finalEmailVerified,
        role,
        isAccountant,
        preferredHub,
        phone: normalizedPhone,
        ...(phoneHmac ? { phoneHmac } : {}),
        ...(normalizedPhone && finalPhoneVerified ? { isPhoneVerified: true, phoneVerifiedAt: new Date() } : {}),
        ...(pendingAfter.companyName ? { companyName: pendingAfter.companyName } : {}),
        ...(pendingAfter.firmName ? { firmName: pendingAfter.firmName } : {}),
      } as any)
    } else {
      // Create final user record
      created = await this.userRepository.create({
        email: normalizedEmail,
        password: pendingAfter.hashedPassword,
        name: pendingAfter.name || null,
        isEmailVerified: finalEmailVerified,
        role,
        isAccountant,
        preferredHub,
        phone: normalizedPhone,
        ...(phoneHmac ? { phoneHmac } : {}),
        ...(normalizedPhone && finalPhoneVerified ? { isPhoneVerified: true, phoneVerifiedAt: new Date() } : {}),
        ...(pendingAfter.companyName ? { companyName: pendingAfter.companyName } : {}),
        ...(pendingAfter.firmName ? { firmName: pendingAfter.firmName } : {}),
      } as any)
    }

    console.log('[complete-signup] User created/updated:', {
      userId: created.id,
      email: created.email,
      isEmailVerified: created.isEmailVerified,
      isPhoneVerified: (created as any).isPhoneVerified,
      phone: created.phone
    })

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
    return { token: session?.token || null, user: { id: created.id, email: created.email, name: created.name, role: created.role, isEmailVerified: !!(created as any).isEmailVerified } }
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response) {
    // Always use the pending-signup flow so unverified users are not persisted to DB.
    // A real user record is only created once the OTP is verified via `complete-signup`.
    return await this.preSignup({
      email: signupDto.email,
      password: signupDto.password,
      name: signupDto.name,
      role: signupDto.role,
      phone: signupDto.phone,
    })
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

      const created = await this.authService.startOtp(normalizeEmail(email), undefined, 5, 'VERIFY_EMAIL')
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
    let refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      try {
        const rawCookie = String(req.headers.cookie || '')
        const cookieMatch = rawCookie === 'NONE' ? null : rawCookie.split(';').map((p: string) => p.trim()).find((p: string) => p.startsWith('refreshToken='))
        if (cookieMatch) {
          const tokenFromHeader = cookieMatch.split('=')[1]
          refreshToken = tokenFromHeader ? String(tokenFromHeader).split(/;|\s/)[0].trim() : refreshToken
        }
      } catch (e) {}
    }
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
    // Dev-only: log raw Cookie header to verify proxy forwards cookies intact
    try {
      if (process.env.ALLOW_TEST_ENDPOINTS === 'true' || (process.env.NODE_ENV || 'development') !== 'production') {
        // eslint-disable-next-line no-console
        console.log('[DEV] Refresh raw cookies:', req.headers.cookie || 'NONE', 'ip=', req.ip, 'ua=', String(req.headers['user-agent'] || ''))
      }
    } catch (e) {}

    // Dev-only: if debug header present, return diagnostic info or execute refresh on demand
    try {
      const debugHeader = String(req.headers['x-debug-allow'] || '')
      if ((process.env.ALLOW_TEST_ENDPOINTS === 'true' || (process.env.NODE_ENV || 'development') !== 'production') && debugHeader) {
        const rawCookie = String(req.headers.cookie || 'NONE')
        let s: any = null
        let tokenFromHeader: string | null = null
        try {
          // attempt a lookup only if a cookie exists
          const cookieMatch = rawCookie === 'NONE' ? null : rawCookie.split(';').map(p => p.trim()).find(p => p.startsWith('refreshToken='))
          tokenFromHeader = cookieMatch ? String(cookieMatch).split('=')[1] : null
          if (tokenFromHeader) s = await this.sessionRepo.findByRefreshToken(tokenFromHeader)
        } catch (e) { /* ignore */ }
        if (debugHeader === 'info') {
          const tokenCharCodes = tokenFromHeader ? Array.from(String(tokenFromHeader)).slice(0,40).map((c: string) => c.charCodeAt(0)) : null
          return { debug: true, rawCookie: rawCookie, tokenFromHeader, tokenLen: tokenFromHeader ? String(tokenFromHeader).length : 0, tokenCharCodes, session: s }
        }
        if (debugHeader === 'exec') {
          // If there's a cookie value, use it; otherwise fall back to throwing
          const cookieMatch = String(req.headers.cookie || '').split(';').map(p => p.trim()).find(p => p.startsWith('refreshToken='))
          const tokenFromHeader = cookieMatch ? cookieMatch.split('=')[1] : null
          if (!tokenFromHeader) {
            return { debug: true, success: false, message: 'no refreshToken in raw cookie header' }
          }
          const result = await this.authService.refresh(tokenFromHeader)
          if (!result) {
            return { debug: true, success: false, rawCookie: rawCookie, session: s }
          }
          // set new refreshed cookies
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          }
          res.cookie('token', result.token, { ...cookieOptions, maxAge: 1000 * 60 * 15 })
          res.cookie('refreshToken', result.refreshToken, cookieOptions)
          return { token: result.token, user: result.user, debug: true }
        }
      }
    } catch (e) {}

    let refreshToken = req.cookies?.refreshToken
    // Fallback: if cookie parsing middleware isn't present (e.g., in some test environments),
    // try to extract refreshToken directly from raw Cookie header.
    if (!refreshToken) {
      try {
        const rawCookie = String(req.headers.cookie || '')
        const cookieMatch = rawCookie === 'NONE' ? null : rawCookie.split(';').map((p: string) => p.trim()).find((p: string) => p.startsWith('refreshToken='))
        let tokenFromHeader: string | null = null
        if (cookieMatch) {
          tokenFromHeader = cookieMatch.split('=')[1]
          // defensive trim: remove any trailing attributes or whitespace
          tokenFromHeader = tokenFromHeader ? String(tokenFromHeader).split(/;|\s/)[0].trim() : tokenFromHeader
        }
        if (tokenFromHeader) {
          refreshToken = tokenFromHeader
          // record a dev-only event to indicate we used fallback parsing
          try { if ((process.env.NODE_ENV || 'development') !== 'production') await this.securityEventRepo.create({ type: 'REFRESH_FALLBACK_HEADER_USED', email: String(refreshToken ?? '').slice(0,12), ipAddress: req.ip, userAgent: String(req.headers['user-agent'] || '') }) } catch (e) {}
        }
      } catch (e) {
        // ignore parsing errors
      }
    }

    if (!refreshToken) {
      // record dev-only event to help debug cookie issues
      try { if ((process.env.NODE_ENV || 'development') !== 'production') await this.securityEventRepo.create({ type: 'REFRESH_FAILED_NO_COOKIE', ipAddress: req.ip, userAgent: String(req.headers['user-agent'] || '') }) } catch (e) {}
      throw new UnauthorizedException()
    }

    const result = await this.authService.refresh(refreshToken)
    if (!result) {
      // record dev-only event with token prefix so we can inspect DB when console logs aren't available
      try { if ((process.env.NODE_ENV || 'development') !== 'production') await this.securityEventRepo.create({ type: 'REFRESH_FAILED_INVALID', email: String(refreshToken ?? '').slice(0,12), ipAddress: req.ip, userAgent: String(req.headers['user-agent'] || '') }) } catch (e) {}
      throw new UnauthorizedException()
    }

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
    const email = normalizeEmail(parsed.data.email)
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
      const email = normalizeEmail(parsed.data.email)
      ok = await this.authService.verifyOtp(email, parsed.data.otpCode, false)
      // eslint-disable-next-line no-console
      console.log('[auth] verify-otp result (email)', { email, ok })
      if (!ok) return { success: false }

      // If this OTP was for email verification, explicitly consume it now; for RESET flows leave it for the reset endpoint to consume
      try {
        const latest = await this.otpRepo.findLatestByEmail(email)
        // eslint-disable-next-line no-console
        console.log('[auth] verify-otp latest row', { email, latest: latest ? { id: latest.id, otpCode: latest.otpCode, purpose: latest.purpose } : null })
        if (latest && (((latest as any).purpose === 'VERIFY_EMAIL') || ((latest as any).purpose === 'MFA'))) {
          try { await this.otpRepo.delete(latest.id) } catch (e) {}
        }
      } catch (e) {}

      // Mark user as email verified
      try {
        const user = await this.userRepository.findByEmail(email)
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
    const email = normalizeEmail(String(req.query?.email || ''))
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
    const email = parsed.data.email ? normalizeEmail(parsed.data.email) : parsed.data.email
    const { otpCode, password, token } = parsed.data
    
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
