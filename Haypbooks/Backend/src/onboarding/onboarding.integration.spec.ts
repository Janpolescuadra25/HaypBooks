import { PrismaService } from '../repositories/prisma/prisma.service'
import { PrismaOnboardingRepository } from '../repositories/prisma/onboarding.repository.prisma'
import { PrismaUserRepository } from '../repositories/prisma/user.repository.prisma'
import { CompanyRepository } from '../companies/company.repository.prisma'
import { CompanyService } from '../companies/company.service'
import { OnboardingService } from './onboarding.service'

jest.setTimeout(30000)

describe('OnboardingService (integration)', () => {
  let prisma: PrismaService
  let onboardingRepo: PrismaOnboardingRepository
  let userRepo: PrismaUserRepository
  let companyRepo: CompanyRepository
  let companySvc: CompanyService
  let svc: OnboardingService

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    prisma = new PrismaService()
    await prisma.$connect()
    onboardingRepo = new PrismaOnboardingRepository(prisma)
    userRepo = new PrismaUserRepository(prisma)
    companyRepo = new CompanyRepository(prisma)
    companySvc = new CompanyService(companyRepo)
    svc = new OnboardingService(onboardingRepo as any, userRepo as any, companySvc as any)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('completing OWNER onboarding creates a Company and returns it', async () => {
    const timestamp = Date.now()
    const email = `int-onboard-${timestamp}@haypbooks.test`
    const companyName = `INT Company ${timestamp}`

    // Create a user
    const user = await userRepo.create({ email, password: 'Test123!', name: 'Int Tester', isEmailVerified: true, role: 'owner' })

    try {
      // Save minimal business step
      await onboardingRepo.save(user.id, 'business', { businessName: companyName })

      // Call onboarding complete (should create tenant and company)
      const res = await svc.complete(user.id, 'full', 'OWNER')
      expect(res).toBeDefined()
      expect(res.success).toBe(true)

      const createdCompany = (res as any).company
      expect(createdCompany).toBeTruthy()
      expect(createdCompany.id).toBeTruthy()

      // Verify company exists in DB
      const dbCompany = await prisma.company.findUnique({ where: { id: createdCompany.id } })
      expect(dbCompany).toBeTruthy()
      expect(dbCompany?.name).toEqual(expect.stringContaining('INT Company'))

      // Verify tenant exists and is associated
      const tenant = await prisma.tenant.findUnique({ where: { id: dbCompany?.tenantId as string } })
      expect(tenant).toBeTruthy()

    } finally {
      // Cleanup (best-effort): delete companies and tenant, then user
      try {
        const tenantUsers = await prisma.tenantUser.findMany({ where: { userId: user.id } })
        for (const tu of tenantUsers) {
          const tenantId = tu.tenantId
          const comps = await prisma.company.findMany({ where: { tenantId } })
          for (const c of comps) {
            await prisma.company.delete({ where: { id: c.id } }).catch(() => {})
          }
          await prisma.tenantUser.deleteMany({ where: { tenantId } }).catch(() => {})
          await prisma.tenant.delete({ where: { id: tenantId } }).catch(() => {})
        }
      } catch (e) {
        // ignore cleanup errors
      }

      try { await userRepo.delete(user.id) } catch (e) { /* ignore */ }
    }
  })
})
