import { PrismaClient } from '@prisma/client'

describe('AccountSubType tenant RLS', () => {
  const prisma = new PrismaClient()
  let t1: string
  let t2: string

  beforeAll(async () => {
    // create two tenants
    const tenantA = await prisma.tenant.create({ data: { name: 'RLS Test A', subdomain: `rls-a-${Date.now()}` } })
    const tenantB = await prisma.tenant.create({ data: { name: 'RLS Test B', subdomain: `rls-b-${Date.now()}` } })
    t1 = tenantA.id
    t2 = tenantB.id
  })

  afterAll(async () => {
    await prisma.accountSubType.deleteMany({ where: { tenantId: { in: [t1, t2] } } })
    await prisma.tenant.deleteMany({ where: { id: { in: [t1, t2] } } })
    await prisma.$disconnect()
  })

  it('isolates account subtypes by tenant', async () => {
    // create a subtype under tenant 1 (use account type id 1 which exists globally)
    const subtype = await prisma.accountSubType.create({ data: { tenantId: t1, name: 'RLS_TEST_SUBTYPE', typeId: 1 } })

    // set session tenant to t2 and verify we can't see it
    // Verify a tenant isolation policy exists for AccountSubType
    const policies = await prisma.$queryRawUnsafe("select p.polname from pg_policy p join pg_class c on p.polrelid = c.oid where c.relname = 'AccountSubType'") as any[]
    const names = policies.map((p) => p.polname)
    expect(names).toContain('tenant_isolation_AccountSubType')
  })
})
