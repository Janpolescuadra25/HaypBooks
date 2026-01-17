import { PrismaClient } from '@prisma/client'
import { PrismaService } from '../../src/repositories/prisma/prisma.service'
import { CompanyRepository } from '../../src/companies/company.repository.prisma'

describe('Tenant creation and default role seeding', () => {
  const prisma = new PrismaService() as PrismaClient
  const companyRepo = new CompanyRepository(prisma as any)

  beforeAll(async () => {
    await prisma.$connect()
    // Ensure basic permissions exist so role seeding attaches permissions
    await prisma.permission.upsert({ where: { key: 'manage:all' }, update: {}, create: { key: 'manage:all', desc: 'Full access for admins' } })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates default roles for new tenant', async () => {
    const subdomain = `test-${Date.now()}`
    const tenant = await companyRepo.create({ name: 'Test Tenant', subdomain, baseCurrency: 'USD' })

    const roles = await prisma.role.findMany({ where: { tenantId: tenant.id } })
    const roleNames = roles.map(r => r.name)

    expect(roleNames).toEqual(expect.arrayContaining(['Owner', 'Admin', 'Bookkeeper', 'Viewer']))

    // cleanup
    await prisma.rolePermission.deleteMany({ where: { roleId: { in: roles.map(r => r.id) } } })
    await prisma.role.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenantUser.deleteMany({ where: { tenantId: tenant.id } })
    await prisma.tenant.delete({ where: { id: tenant.id }, select: { id: true } })
  }, 20000)
})
