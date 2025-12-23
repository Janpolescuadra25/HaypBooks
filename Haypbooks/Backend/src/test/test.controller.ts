import { Controller, Get, Query, ForbiddenException, Post, Body } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Controller('api/test')
export class TestController {
  constructor(private readonly prisma: PrismaService) {}

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
  async latestOtp(@Query('email') email: string, @Query('purpose') purpose?: string) {
    this.ensureEnabled()
    const where: any = { email }
    if (purpose) where.purpose = purpose
    const row = await this.prisma.otp.findFirst({ where, orderBy: { createdAt: 'desc' } })
    return row || null
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
  async createUser(@Body() body: { email: string; password: string; name?: string; isEmailVerified?: boolean; isAccountant?: boolean; role?: string }) {
    this.ensureEnabled()
    const hash = await bcrypt.hash(body.password, 10)
    const created = await this.prisma.user.create({ data: { email: body.email, password: hash, name: body.name || 'Test User', isEmailVerified: !!body.isEmailVerified, isAccountant: !!body.isAccountant, role: body.role } })
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

    const updated = await this.prisma.user.update({ where, data: { trialEndsAt: body.trialEndsAt, trialStartedAt: new Date().toISOString() } })
    return { id: updated.id, trialEndsAt: updated.trialEndsAt }
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
