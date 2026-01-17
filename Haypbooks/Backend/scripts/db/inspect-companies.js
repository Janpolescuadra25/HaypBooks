const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        tenant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // For each company, fetch tenant users (TenantUser records) for its tenant
    const results = []
    for (const c of companies) {
      const tenantUsers = await prisma.tenantUser.findMany({ where: { tenantId: c.tenantId }, select: { userId: true, role: true, isOwner: true } })
      results.push({ ...c, tenantUsers })
    }

    console.log(JSON.stringify(results, null, 2))
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
})()
