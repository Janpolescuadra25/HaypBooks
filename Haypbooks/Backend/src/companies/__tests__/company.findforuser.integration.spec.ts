import { PrismaService } from '../../repositories/prisma/prisma.service'
import { CompanyRepository } from '../company.repository.prisma'

jest.setTimeout(30000)

describe('CompanyRepository (integration) - findForUser owned filter', () => {
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

  test('owned filter returns only companies where tenantUser.isOwner = true for user', async () => {
    // Setup: create two tenants and companies and tenantUsers
    // tenant A -> user owner (u-owner) and user member (u-member)
    // tenant B -> user member only (u-member)

    const uOwner = await prisma.user.create({ data: { email: `owner-${Date.now()}@test`, password: 'X' } })
    const uMember = await prisma.user.create({ data: { email: `member-${Date.now()}@test`, password: 'X' } })

    // Tenant A
    const tenantA = await prisma.tenant.create({ data: { name: 'Tenant A' } })
    const companyA = await prisma.company.create({ data: { tenantId: tenantA.id, name: 'Company A', isActive: true } })
    await prisma.tenantUser.create({ data: { tenantId: tenantA.id, userId: uOwner.id, role: 'owner', isOwner: true, joinedAt: new Date(), status: 'ACTIVE' } })
    await prisma.tenantUser.create({ data: { tenantId: tenantA.id, userId: uMember.id, role: 'member', isOwner: false, joinedAt: new Date(), status: 'ACTIVE' } })

    // Tenant B
    const tenantB = await prisma.tenant.create({ data: { name: 'Tenant B' } })
    const companyB = await prisma.company.create({ data: { tenantId: tenantB.id, name: 'Company B', isActive: true } })
    await prisma.tenantUser.create({ data: { tenantId: tenantB.id, userId: uMember.id, role: 'member', isOwner: false, joinedAt: new Date(), status: 'ACTIVE' } })

    try {
      // Act: fetch owned for uOwner (should return Company A)
      const ownedForOwner = await repo.findForUser(uOwner.id, 'owned')
      expect(Array.isArray(ownedForOwner)).toBe(true)
      expect(ownedForOwner.length).toBeGreaterThan(0)
      const idsOwner = ownedForOwner.map((c: any) => c.id)
      expect(idsOwner).toContain(companyA.id)
      expect(idsOwner).not.toContain(companyB.id)

      // Act: fetch owned for uMember (should return none)
      const ownedForMember = await repo.findForUser(uMember.id, 'owned')
      expect(Array.isArray(ownedForMember)).toBe(true)
      const idsMember = ownedForMember.map((c: any) => c.id)
      expect(idsMember).not.toContain(companyA.id)
      expect(idsMember).not.toContain(companyB.id)

      // Default (no filter) for uMember should include both companies for which uMember is a member
      const allForMember = await repo.findForUser(uMember.id)
      const idsAll = allForMember.map((c: any) => c.id)
      expect(idsAll).toContain(companyA.id)
      expect(idsAll).toContain(companyB.id)

    } finally {
      // Cleanup
      await prisma.company.deleteMany({ where: { id: { in: [companyA.id, companyB.id] } } }).catch(() => {})
      await prisma.tenantUser.deleteMany({ where: { userId: { in: [uOwner.id, uMember.id] } } }).catch(() => {})
      await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } }).catch(() => {})
      await prisma.user.deleteMany({ where: { id: { in: [uOwner.id, uMember.id] } } }).catch(() => {})
    }
  })
})