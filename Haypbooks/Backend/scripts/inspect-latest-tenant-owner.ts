import { PrismaClient } from '@prisma/client'

;(async () => {
  const p = new PrismaClient()
  try {
    const tenant = await p.tenant.findFirst({ orderBy: { createdAt: 'desc' }, include: { users: { take: 1 } } })
    if (!tenant) {
      console.log('No tenant found')
      return
    }
    const ownerUserId = tenant.users[0].userId
    const user = await p.user.findUnique({ where: { id: ownerUserId } })
    console.log('\nLatest tenant:', { id: tenant.id, name: tenant.name, createdAt: tenant.createdAt })
    console.log('\nOwner user record:')
    console.dir(user, { depth: 3 })
  } catch (e) {
    console.error(e)
  } finally {
    await p.$disconnect()
    process.exit(0)
  }
})()
