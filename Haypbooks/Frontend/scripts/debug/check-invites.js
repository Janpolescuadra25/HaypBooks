const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const invites = await prisma.workspaceInvite.findMany({ where: { email: { contains: 'accountant-' } }, orderBy: { invitedAt: 'desc' }, take: 5 })
    console.log('Recent invites:', JSON.stringify(invites, null, 2))
    const latest = invites[0]
    if (!latest) {
      console.log('No invites found')
      process.exit(0)
    }
    const email = latest.email
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('User for invite email:', JSON.stringify(user, null, 2))
    if (user) {
      const tenantUsers = await prisma.workspaceUser.findMany({ where: { userId: user.id } })
      console.log('TenantUser rows for user:', JSON.stringify(tenantUsers, null, 2))
    }
  } catch (e) {
    console.error('Error running check:', e)
  } finally {
    await prisma.$disconnect()
  }
})()