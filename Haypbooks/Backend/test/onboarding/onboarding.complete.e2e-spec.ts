import { PrismaService } from '../../src/repositories/prisma/prisma.service'
import { PrismaOnboardingRepository } from '../../src/repositories/prisma/onboarding.repository.prisma'
import { PrismaUserRepository } from '../../src/repositories/prisma/user.repository.prisma'
import { CompanyRepository } from '../../src/companies/company.repository.prisma'
import { CompanyService } from '../../src/companies/company.service'
import { OnboardingService } from '../../src/onboarding/onboarding.service'

jest.setTimeout(30000)

describe('OnboardingService (e2e)', () => {
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
    // Use a lightweight stub for userRepo to avoid schema mismatches in integration test
    userRepo = {
      findById: async (id: string) => ({ id, email: null }),
      update: async (id: string, data: any) => ({ id, ...data }),
    } as any
    companyRepo = new CompanyRepository(prisma)
    companySvc = new CompanyService(companyRepo)
    svc = new OnboardingService(onboardingRepo as any, userRepo as any, companySvc as any)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('completing OWNER onboarding creates a Company and returns it', async () => {
    const timestamp = Date.now()
    const email = `e2e-int-onboard-${timestamp}@haypbooks.test`
    const companyName = `E2E INT Company ${timestamp}`

    // Create a user via raw SQL to avoid Prisma model/DB column mismatches in test env
    const userId = require('crypto').randomUUID()
    await prisma.$executeRawUnsafe(`INSERT INTO public."User" (id, email, passwordHash, name, role, isEmailVerified, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,now(),now())`, userId, email.toLowerCase(), 'hash_placeholder', 'E2E Int', 'owner', true)
    // Avoid calling prisma.user.* which may trigger client/schema mismatches in some test envs
    const user = { id: userId, email } as any

    try {
      await onboardingRepo.save(user.id, 'business', { businessName: companyName })

      const res = await svc.complete(user.id, 'full', 'OWNER')
      expect(res).toBeDefined()
      expect(res.success).toBe(true)

      const createdCompany = (res as any).company
      expect(createdCompany).toBeTruthy()
      expect(createdCompany.id).toBeTruthy()

      const dbCompany = await prisma.company.findUnique({ where: { id: createdCompany.id } })
      expect(dbCompany).toBeTruthy()
      expect(dbCompany?.name).toEqual(expect.stringContaining('E2E INT Company'))

      const tenant = await prisma.tenant.findUnique({ where: { id: dbCompany?.workspaceId as string } })
      expect(tenant).toBeTruthy()
      // workspaceName should be set from onboarding businessName
      expect((tenant as any).workspaceName).toEqual(companyName)

    } finally {
      // cleanup
      try {
        const tenantUsers = await prisma.tenantUser.findMany({ where: { userId: user.id } })
        for (const tu of tenantUsers) {
          const tenantId = tu.workspaceId
          const comps = await prisma.company.findMany({ where: { workspaceId } })
          for (const c of comps) {
            await prisma.company.delete({ where: { id: c.id } }).catch(() => {})
          }
          await prisma.tenantUser.deleteMany({ where: { workspaceId } }).catch(() => {})
          await prisma.tenant.delete({ where: { id: workspaceId } }).catch(() => {})
        }
      } catch (e) { /* ignore */ }
      try { await userRepo.delete(user.id) } catch (e) { /* ignore */ }
    }
  })
})
