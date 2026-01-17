import { PrismaClient } from '@prisma/client'

;(async () => {
  const prisma = new PrismaClient()
  try {
    const since = new Date(Date.now() - 1000 * 60 * 60) // last 60m
    const tenants = await prisma.tenant.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { users: { include: { user: { select: { email: true } } } } }
    })

    console.log('\n=== Recent Tenants ===')
    tenants.forEach(t => {
      console.log({ id: t.id, name: t.name, createdAt: t.createdAt, companiesCreated: t.companiesCreated, trialUsed: t.trialUsed, users: t.users.map(u => ({ userId: u.userId, isOwner: u.isOwner, email: u.user?.email })) })
    })

    const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
    console.log('\n=== Recent Companies ===')
    companies.forEach(c => console.log({ id: c.id, name: c.name, tenantId: c.tenantId, createdAt: c.createdAt }))

  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
})()
