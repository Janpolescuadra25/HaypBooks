const { PrismaClient } = require('@prisma/client')
const email = process.argv[2] || 'demo@haypbooks.test'
;(async () => {
  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log(`No user found with email ${email}`)
      process.exit(0)
    }
    console.log('User:', { id: user.id, email: user.email })
    const tenants = await prisma.workspaceUser.findMany({ where: { userId: user.id }, select: { workspaceId: true, role: true, isOwner: true } })
    console.log('Tenant links:', tenants)
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
})()
