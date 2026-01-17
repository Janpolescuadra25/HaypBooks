const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const invite = (await prisma.tenantInvite.findMany({ where: { email: { contains: 'accountant-' } }, orderBy: { invitedAt: 'desc' }, take: 1 }))[0]
    console.log('Using invite:', invite)
    if (!invite) return
    const user = await prisma.user.findUnique({ where: { email: invite.email } })
    console.log('User:', user)
    const data = {
      where: { tenantId_userId: { tenantId: invite.tenantId, userId: user.id } },
      create: {
        tenantId: invite.tenantId,
        userId: user.id,
        role: invite.role ? invite.role.name : 'member',
        roleId: invite.roleId || null,
        isOwner: false,
        joinedAt: new Date(),
        status: 'ACTIVE',
      },
      update: { status: 'ACTIVE', role: invite.role ? invite.role.name : 'member', roleId: invite.roleId || null },
    }
    try {
      const res = await prisma.tenantUser.upsert(data)
      console.log('Upserted tenantUser:', res)
    } catch (e) {
      console.error('Upsert failed:', e)
    }
  } catch (e) {
    console.error('Error in script:', e)
  } finally {
    await prisma.$disconnect()
  }
})()