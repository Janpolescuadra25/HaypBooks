import { PrismaService } from '../../src/repositories/prisma/prisma.service'
import { CompanyRepository } from '../../src/companies/company.repository.prisma'

jest.setTimeout(20000)

describe('CompanyRepository.createCompanyRecord (e2e)', () => {
  let prisma: PrismaService
  let repo: CompanyRepository

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    prisma = new PrismaService()
    await prisma.$connect()
    repo = new CompanyRepository(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  test('creates a Company record under an existing tenant', async () => {
    const tenantId = require('crypto').randomUUID()
    const companyName = `E2E-CREATE-REC-${Date.now()}`

    // Create tenant via raw SQL (minimal required columns)
    // Insert minimal tenant row (avoid referencing columns that may be missing in some DB snapshots)
    await prisma.$executeRawUnsafe(`INSERT INTO public."Tenant" (id, "createdAt", "updatedAt") VALUES ($1::uuid, now(), now())`, tenantId)

    try {
      const created = await repo.createCompanyRecord({ tenantId, name: companyName, currency: 'USD' })
      expect(created).toBeTruthy()
      expect(created.name).toBe(companyName)

      const db = await prisma.company.findUnique({ where: { id: created.id } })
      expect(db).toBeTruthy()
      expect(db?.tenantId).toBe(tenantId)

    } finally {
      // Cleanup
      try { await prisma.company.deleteMany({ where: { tenantId } }) } catch (e) { /* ignore */ }
      try { await prisma.tenant.delete({ where: { id: tenantId } }) } catch (e) { /* ignore */ }
    }
  })
})