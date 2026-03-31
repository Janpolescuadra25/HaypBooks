const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run(email) {
  console.log('Querying DB for companies/tenants involving email:', email)
  try {
    // find user
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('user:', user ? { id: user.id, email: user.email, createdAt: user.createdAt } : null)

    // companies associated with user's tenants
    const tenantUsers = await prisma.tenantUser.findMany({ where: { userId: user ? user.id : undefined } })
    console.log('tenantUsers:', tenantUsers)

    const companiesRecent = await prisma.$queryRaw`
      SELECT c.id, c."tenantId", c.name, c."createdAt"
      FROM public."Company" c
      LEFT JOIN public."Tenant" t ON t.id::text = c."tenantId"::text
      WHERE c.name ILIKE 'E2E%'
      OR c."createdAt" > now() - interval '1 hour'
      ORDER BY c."createdAt" DESC
      LIMIT 20
    `
    console.log('recent companies:', companiesRecent)

    const tenantsRecent = await prisma.$queryRaw`
      SELECT id, name, workspace_name, createdAt FROM public."Tenant" WHERE workspace_name IS NOT NULL OR createdAt > now() - interval '1 hour' ORDER BY createdAt DESC LIMIT 20
    `
    console.log('recent tenants:', tenantsRecent)

  } catch (e) {
    console.error('db query error:', e.message || e)
  } finally {
    await prisma.$disconnect()
  }
}

run(process.argv[2]).catch(e => { console.error(e); process.exit(1) })
