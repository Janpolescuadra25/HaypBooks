import { Controller, Get, Query, ForbiddenException, Post, Body, Req, Inject } from '@nestjs/common'
import * as bcrypt from '../utils/bcrypt-fallback'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { PendingSignupService } from '../auth/pending-signup.service'
import { PrismaAuthService } from '../auth/prisma-auth.service'
import { CompanyRepository } from '../companies/company.repository.prisma'

@Controller('api/test')
export class TestController {
  constructor(private readonly prisma: PrismaService, private readonly pendingSignupService: PendingSignupService, private readonly authService: PrismaAuthService) {}

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
      if (purpose === 'VERIFY') {
        // Legacy alias used by older Playwright scripts
        if (email) where.purpose = 'VERIFY_EMAIL'
        else if (phone) where.purpose = 'MFA'
        else where.purpose = 'VERIFY_EMAIL'
      } else if (purpose === 'VERIFY_PHONE') {
        where.purpose = 'MFA'
      } else {
        where.purpose = purpose as any
      }
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
    if (body.purpose === 'VERIFY') {
      // Legacy alias used by older Playwright scripts
      purpose = body.phone ? 'MFA' : 'VERIFY_EMAIL'
    }
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
    if (body.purpose === 'VERIFY') purpose = 'MFA'
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

  @Get('check-user-verification')
  async checkUserVerification(@Query('email') email: string) {
    this.ensureEnabled()
    if (!email) return { error: 'email query parameter required' }
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return { error: 'user not found' }
    const hasPhone = !!user.phone
    const emailVerified = !!user.isEmailVerified
    const phoneVerified = !!(user as any).isPhoneVerified
    return {
      userId: user.id,
      email: user.email,
      phone: user.phone || null,
      isEmailVerified: emailVerified,
      isPhoneVerified: phoneVerified,
      phoneVerifiedAt: (user as any).phoneVerifiedAt || null,
      hasPhone,
      canLogin: hasPhone ? (emailVerified || phoneVerified) : emailVerified,
      policy: hasPhone ? 'OR (email OR phone)' : 'email required'
    }
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

  @Post('echo-headers')
  async echoHeaders(@Body() _body: any, @Req() req: any) {
    this.ensureEnabled()
    return { headers: req.headers }
  }

  @Post('session/find-by-refresh')
  async findSessionByRefresh(@Body() body: { token?: string }) {
    this.ensureEnabled()
    if (!body || !body.token) return { error: 'missing token' }
    const session = await this.prisma.session.findUnique({ where: { refreshToken: body.token } })
    return session || null
  }

  @Post('debug/refresh')
  async debugRefresh(@Body() body: { token?: string }) {
    this.ensureEnabled()
    if (!body || !body.token) return { error: 'missing token' }
    const result = await this.authService.refresh(body.token)
    return { result }
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

  @Post('create-company')
  async createCompany(@Body() body: { email?: string; name?: string; currency?: string; createTenant?: boolean }) {
    this.ensureEnabled()
    if (!body || !body.email || !body.name) return { error: 'missing email or name' }

    const user = await this.prisma.user.findUnique({ where: { email: body.email } })
    if (!user) return { error: 'user not found' }

    // Find tenant associations for the user
    let tenantUsers = await this.prisma.tenantUser.findMany({ where: { userId: user.id }, select: { tenantId: true } })
    let tenantId: string | null = null

    if (!tenantUsers || tenantUsers.length === 0) {
      // Optionally create a tenant and associate the user if none exist (test-only convenience)
      if (body.createTenant === false) return { error: 'user not associated with any tenant' }
      const t = await this.prisma.tenant.create({ data: { name: `${body.name} (E2E)`, subdomain: `e2e-${Date.now()}` } })
      await this.prisma.tenantUser.create({ data: { tenantId: t.id, userId: user.id, role: 'owner', isOwner: true } as any })
      tenantId = t.id
    } else {
      tenantId = tenantUsers[0].tenantId
    }

    // Check if company already exists
    const existing = await this.prisma.company.findFirst({ where: { tenantId, name: body.name } })
    if (existing) return { created: false, company: existing }

    // Use the repository method so trial activation logic is applied for first-company trials
    // The test controller may not have CompanyRepository injected in all test contexts; fall back to a manual instance
    const companyRepo: any = (this as any).companyRepo || new CompanyRepository(this.prisma as any)
    const company = await companyRepo.createCompanyRecord({ tenantId, name: body.name, currency: body.currency || 'USD' })
    return { created: true, company }
  }

  @Post('delete-company')
  async deleteCompany(@Body() body: { email?: string; name?: string; companyId?: string; deleteTenant?: boolean }) {
    this.ensureEnabled()
    if (!body || (!body.companyId && (!body.email || !body.name))) return { error: 'missing companyId or (email and name)' }

    // Resolve company by id OR by email+name
    let companies = [] as any[]
    if (body.companyId) {
      const c = await this.prisma.company.findUnique({ where: { id: body.companyId }, include: { tenant: true } })
      if (c) companies = [c]
    } else {
      // Find user and tenant(s)
      const user = await this.prisma.user.findUnique({ where: { email: body.email } })
      if (!user) return { deleted: 0, message: 'user not found' }
      const tenantUsers = await this.prisma.tenantUser.findMany({ where: { userId: user.id }, select: { tenantId: true } })
      const tenantIds = tenantUsers.map(t => t.tenantId)
      if (tenantIds.length === 0) return { deleted: 0, message: 'user not associated with any tenant' }
      companies = await this.prisma.company.findMany({ where: { tenantId: { in: tenantIds }, name: body.name }, include: { tenant: true } })
    }

    if (!companies || companies.length === 0) return { deleted: 0, message: 'no matching company found' }

    // Safety: ensure companies look test-created (name contains 'E2E' or tenant.subdomain startsWith 'e2e-' or tenant.name contains '(E2E)')
    const safeToDelete = companies.filter(c => (c.name && c.name.includes('E2E')) || (c.tenant && c.tenant && typeof c.tenant.subdomain === 'string' && c.tenant.subdomain.startsWith('e2e-')) || (c.tenant && c.tenant.name && c.tenant.name.includes('(E2E)')))

    if (safeToDelete.length === 0) return { deleted: 0, message: 'matching companies found but none appear to be test-created (skipping)' }

    let deletedCount = 0
    for (const c of safeToDelete) {
      try {
        // delete company record (Prisma will enforce cascade/null behavior per schema)
        await this.prisma.company.delete({ where: { id: c.id } })
        deletedCount++
        // optionally delete tenant if requested and tenant appears test-created and has no other companies/users (best-effort)
        if (body.deleteTenant && c.tenant) {
          const tenantId = c.tenant.id
          try {
            // ensure the tenant looks like a test tenant
            if ((c.tenant.subdomain && c.tenant.subdomain.startsWith('e2e-')) || (c.tenant.name && c.tenant.name.includes('(E2E)'))) {
              // check for tenant system accounts; if any exist, skip tenant deletion
              const hasSystemAccounts = (await this.prisma.account.findMany({ where: { tenantId, isSystem: true }, select: { id: true }, take: 1 })).length > 0
              if (hasSystemAccounts) {
                // Skip deleting tenant if system accounts are present (conservative, non-destructive)
                continue
              }

              // check if any other non-system rows exist for tenant
              const users = await this.prisma.tenantUser.findMany({ where: { tenantId } })
              const otherCompanies = await this.prisma.company.findMany({ where: { tenantId } })
              if (users.length <= 1 && otherCompanies.length === 0) {
                await this.prisma.tenant.delete({ where: { id: tenantId } })
              }
            }
          } catch (e) {
            // ignore tenant deletion errors (best-effort)
          }
        }
      } catch (e) {
        // ignore failed deletes for individual companies
      }
    }

    return { deleted: deletedCount }
  }

  @Get('companies')
  async listCompaniesForUser(@Query('email') email: string) {
    this.ensureEnabled()
    if (!email) return []

    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return []

    // Find tenant associations for the user
    const tenantUsers = await this.prisma.tenantUser.findMany({ where: { userId: user.id }, select: { tenantId: true } })
    const tenantIds = tenantUsers.map(t => t.tenantId)

    if (tenantIds.length === 0) return []

    const companies = await this.prisma.company.findMany({ where: { tenantId: { in: tenantIds } }, select: { id: true, tenantId: true, name: true, createdAt: true } })
    return companies
  }
}

