import { Controller, Get, Query, ForbiddenException, Post, Body } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { PendingSignupService } from '../auth/pending-signup.service'

@Controller('api/test')
export class TestController {
  constructor(private readonly prisma: PrismaService, private readonly pendingSignupService: PendingSignupService) {}

  private ensureEnabled() {
    const allowFlag = process.env.ALLOW_TEST_ENDPOINTS === 'true'
    const nodeEnv = process.env.NODE_ENV
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    const hasToken = !!process.env.ALLOW_TEST_ENDPOINTS_TOKEN

    /*
     * Permit test-only endpoints only when one of these is true:
     *  - NODE_ENV === 'test' (explicit test run)
     *  - ALLOW_TEST_ENDPOINTS=true AND (running in development OR running in CI OR a token is present)
     * This prevents enabling the endpoints in production by accident when ALLOW_TEST_ENDPOINTS
     * is set to true on a live server.
     */
    if (nodeEnv === 'test') return

    // A secret token (ALLOW_TEST_ENDPOINTS_TOKEN) will always allow access when present
    if (hasToken) return

    // ALLOW_TEST_ENDPOINTS must be true and the process should be running in development or CI
    if (allowFlag && (nodeEnv === 'development' || isCI)) return

    throw new ForbiddenException('Test endpoints disabled; enable only in development/CI or set NODE_ENV=test or provide ALLOW_TEST_ENDPOINTS_TOKEN')
  }

  @Get('otp/latest')
  async latestOtp(@Query('email') email?: string, @Query('phone') phone?: string, @Query('purpose') purpose?: string) {
    this.ensureEnabled()
    const where: any = {}
    if (email) where.email = email
    if (phone) where.phone = phone
    if (purpose) {
      // Map incoming purpose strings to allowed enum values
      if (purpose === 'VERIFY_PHONE') where.purpose = 'MFA'
      else where.purpose = purpose as any
    }
    if (!email && !phone) return null
    const row = await this.prisma.otp.findFirst({ where, orderBy: { createdAt: 'desc' } })
    return row || null
  }

  @Post('create-otp')
  // Return 201 Created for test helper creation convenience
  async createOtp(@Body() body: { email?: string; phone?: string; otp?: string; purpose?: string; ttlMinutes?: number }) {
    this.ensureEnabled()
    if (!body || (!body.email && !body.phone)) return { error: 'missing email or phone' }
    const code = body.otp || String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    const ttl = body.ttlMinutes || 5
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000)
    // Map free-form purpose values to allowed OtpPurpose
    let purpose: any = 'RESET'
    if (body.purpose === 'VERIFY_EMAIL') purpose = 'VERIFY_EMAIL'
    else if (body.purpose === 'MFA') purpose = 'MFA'
    else if (body.purpose === 'VERIFY_PHONE') purpose = 'MFA' // treat phone verification as MFA in DB

    const created = await this.prisma.otp.create({ data: { email: body.email || null, phone: body.phone || null, otpCode: code, purpose, expiresAt } })
    return { otp: created.otpCode }
  }

  @Post('create-otps')
  async createOtps(@Body() body: { phones?: string[]; otp?: string; purpose?: string; ttlMinutes?: number }) {
    this.ensureEnabled()
    if (!body || !body.phones || !Array.isArray(body.phones) || body.phones.length === 0) return { error: 'missing phones' }
    const ttl = body.ttlMinutes || 5
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000)
    let purpose: any = 'RESET'
    if (body.purpose === 'VERIFY_EMAIL') purpose = 'VERIFY_EMAIL'
    else if (body.purpose === 'MFA') purpose = 'MFA'
    else if (body.purpose === 'VERIFY_PHONE') purpose = 'MFA'

    const results: Record<string, string> = {}
    for (const p of body.phones) {
      const code = body.otp || String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
      const created = await this.prisma.otp.create({ data: { phone: p, otpCode: code, purpose, expiresAt, email: null } })
      results[p] = created.otpCode
    }

    return { otps: results }
  }

  @Post('force-complete-signup')
  async forceCompleteSignup(@Body() body: { signupToken?: string }) {
    this.ensureEnabled()
    if (!body || !body.signupToken) return { error: 'missing signupToken' }
    const pending = await this.pendingSignupService.get(body.signupToken)
    if (!pending) return { error: 'pending signup not found' }

    // Ensure no existing verified user
    const existing = await this.prisma.user.findUnique({ where: { email: pending.email } })
    if (existing && existing.isEmailVerified) return { error: 'email already verified' }

    // Create final user record
    const created = await this.prisma.user.create({ data: { email: pending.email, password: pending.hashedPassword, name: pending.name || null, isEmailVerified: true, role: pending.role || 'owner', phone: pending.phone || null } as any })

    try { await this.pendingSignupService.delete(body.signupToken) } catch (e) { /* ignore */ }

    return { success: true, user: { id: created.id, email: created.email } }
  }

  @Post('force-verify-user')
  async forceVerifyUser(@Body() body: { email?: string; phone?: string; type?: 'email'|'phone' }) {
    this.ensureEnabled()
    if ((!body || !body.email) && (!body || !body.phone)) return { error: 'missing email or phone' }

    let user: any = null
    if (body.email) user = await this.prisma.user.findUnique({ where: { email: body.email } })
    else if (body.phone) user = await this.prisma.user.findFirst({ where: { phone: body.phone } })
    if (!user) return { error: 'user not found' }

    const data: any = {}
    if (body.type === 'phone' || body.phone) {
      data.isPhoneVerified = true
      data.phoneVerifiedAt = new Date()
    }
    if (body.type === 'email' || body.email) {
      data.isEmailVerified = true
    }

    const updated = await this.prisma.user.update({ where: { id: user.id }, data })
    return { success: true, user: { id: updated.id, email: updated.email, isEmailVerified: updated.isEmailVerified, isPhoneVerified: updated.isPhoneVerified } }
  }

  @Post('force-complete-onboarding')
  async forceCompleteOnboarding(@Body() body: { email?: string; mode?: 'quick'|'full' }) {
    this.ensureEnabled()
    if (!body || !body.email) return { error: 'missing email' }
    const user = await this.prisma.user.findUnique({ where: { email: body.email } })
    if (!user) return { error: 'user not found' }
    const mode = body.mode || 'quick'
    const updated = await this.prisma.user.update({ where: { id: user.id }, data: { onboardingComplete: true, onboardingMode: mode } as any })
    return { success: true, user: { id: updated.id, email: updated.email, onboardingComplete: updated.onboardingComplete, onboardingMode: updated.onboardingMode } }
  }
  @Get('user')
  async getUser(@Query('email') email: string) {
    this.ensureEnabled()
    const user = await this.prisma.user.findUnique({ where: { email } })
    return user || null
  }

  @Get('users')
  async listUsers() {
    this.ensureEnabled()
    // return a safe, small list of user fields for test inspection
    const rows = await this.prisma.user.findMany({ select: { id: true, email: true, name: true, isEmailVerified: true, onboardingComplete: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 200 })
    return rows
  }

  @Post('create-user')
  async createUser(@Body() body: { email: string; password: string; name?: string; phone?: string; isEmailVerified?: boolean; isAccountant?: boolean; role?: string }) {
    this.ensureEnabled()
    const hash = await bcrypt.hash(body.password, 10)
    const created = await this.prisma.user.create({ data: { email: body.email, password: hash, name: body.name || 'Test User', phone: body.phone || null, isEmailVerified: !!body.isEmailVerified, isAccountant: !!body.isAccountant, role: body.role } })
    return { id: created.id, email: created.email }
  }

  @Post('set-trial')
  async setTrial(@Body() body: { email?: string; id?: string; trialEndsAt: string }) {
    this.ensureEnabled()
    if (!body || !body.trialEndsAt) return { error: 'missing trialEndsAt' }
    // Prefer identifying by id, fallback to email
    let where: any = {}
    if (body.id) where = { id: body.id }
    else if (body.email) where = { email: body.email }
    else return { error: 'missing id or email' }

    const updated = await this.prisma.user.update({ where, data: { trialEndsAt: body.trialEndsAt, trialStartedAt: new Date().toISOString() } as any })
    return { id: updated.id, trialEndsAt: (updated as any).trialEndsAt }
  }

  @Post('update-user')
  async updateUser(@Body() body: { email?: string; id?: string; data: any }) {
    this.ensureEnabled()
    if (!body || !body.data) return { error: 'missing data' }
    let where: any = {}
    if (body.id) where = { id: body.id }
    else if (body.email) where = { email: body.email }
    else return { error: 'missing id or email' }

    const allowed = ['isAccountant','role','preferredHub','name']
    const toUpdate: any = {}
    for (const k of allowed) if (body.data[k] !== undefined) toUpdate[k] = body.data[k]
    if (Object.keys(toUpdate).length === 0) return { error: 'no allowed fields to update' }

    const updated = await this.prisma.user.update({ where, data: toUpdate })
    return { id: updated.id, ...toUpdate }
  }

  @Get('sessions')
  async listSessions(@Query('email') email: string) {
    this.ensureEnabled()
    if (!email) return []
    // join user->session and return session rows
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return []
    const sessions = await this.prisma.session.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } })
    return sessions
  }
}
