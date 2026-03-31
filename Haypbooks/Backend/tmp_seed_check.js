const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' } } })

;(async () => {
  const user = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
  console.log('demo user:', !!user, user && { email: user.email, isEmailVerified: user.isEmailVerified })
  const ws = await prisma.workspace.findFirst({ where: { ownerUserId: user ? user.id : null } })
  console.log('workspace:', !!ws, ws && ws.id)
  const c = await prisma.company.findFirst()
  console.log('company', !!c, c && { id: c.id, workspaceId: c.workspaceId })
  await prisma.$disconnect()
})().catch(e => { console.error(e); process.exit(1) })
