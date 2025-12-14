import { Controller, Post, Body, Res, HttpCode, HttpStatus, Inject, NotFoundException, Req, UnauthorizedException, UseGuards, Get } from '@nestjs/common'
import { Response } from 'express'
import { PrismaAuthService } from './prisma-auth.service'
import { VerifyOtpSchema, ResetPasswordSchema, ForgotPasswordSchema } from './schemas'
import { USER_REPOSITORY, SESSION_REPOSITORY, OTP_REPOSITORY } from '../repositories/prisma/prisma-repositories.module'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { IUserRepository } from '../repositories/interfaces/user.repository.interface'
import { LoginDto, SignupDto, ForgotPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/auth.dto'

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: PrismaAuthService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessionRepo: any,
    @Inject(OTP_REPOSITORY) private readonly otpRepo: any,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const ua = req.headers['user-agent'] || ''
    const result = await this.authService.login(loginDto.email, loginDto.password, req.ip || req.connection?.remoteAddress, String(ua))

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

    return result
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(signupDto.email, signupDto.password, signupDto.name)

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    res.cookie('token', result.token, cookieOptions)
    res.cookie('email', result.user.email, cookieOptions)
    res.cookie('userId', result.user.id, cookieOptions)
    res.cookie('role', result.user.role, cookieOptions)
    if (result.user.onboardingMode) res.cookie('onboardingMode', result.user.onboardingMode, cookieOptions)
    // After signup, send a verification OTP to user's email so they can verify ownership
    try {
      const created = await this.authService.startOtp(result.user.email, undefined, 5, 'VERIFY_EMAIL')
      console.log(`Verification OTP for ${result.user.email}: ${created.otpCode}`)
      // In development, attach OTP to response to make testing easier
      if (process.env.NODE_ENV !== 'production') {
        (result as any)._devOtp = created.otpCode
      }
    } catch (e) {
      // ignore errors
    }

    return result
  }

  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  async sendVerification(@Body() body: { email: string }) {
    const { email } = body
    // do not reveal existence of email
    try {
      const created = await this.authService.startOtp(email, undefined, 5, 'VERIFY_EMAIL')
      console.log(`Verification OTP for ${email}: ${created.otpCode}`)
      if (process.env.NODE_ENV !== 'production') return { success: true, otp: created.otpCode }
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
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const parsed = VerifyOtpSchema.safeParse(body)
    if (!parsed.success) return { success: false }
    const ok = await this.authService.verifyOtp(parsed.data.email, parsed.data.otpCode)
    return { success: ok }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    const parsed = ResetPasswordSchema.safeParse(body)
    if (!parsed.success) throw new NotFoundException('Invalid reset payload')
    const { email, otpCode, password, token } = parsed.data
    // support token reset flow in future
    if (!token && (!email || !otpCode)) throw new NotFoundException('Missing token or email/otp')
    const user = await this.userRepository.findByEmail(email!)
    if (!user) return { success: true }

    // verify and consume the OTP for password reset so it cannot be reused
    const valid = await this.authService.verifyOtp(email!, otpCode!, true)
    if (!valid) throw new NotFoundException('OTP invalid or expired')

    // Hash and update password
    const hashed = await require('bcrypt').hash(password, 10)
    await this.userRepository.update(user.id, { password: hashed })
    return { success: true }
  }
}
