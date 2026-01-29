import { PrismaClient } from '@prisma/client'

;(async () => {
  const prisma = new PrismaClient()
  try {
    const rows = await prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { users: { include: { user: { select: { email: true } } } } }
    })

    const w = rows.filter(r => r.companiesCreated === 0 || r.companiesCreated === null)
    console.log('Tenants without companies (last 50):')
    w.forEach(r => console.log({ id: r.id, name: r.name, createdAt: r.createdAt, companiesCreated: r.companiesCreated, users: r.users.map(u => u.user?.email) }))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
})()
