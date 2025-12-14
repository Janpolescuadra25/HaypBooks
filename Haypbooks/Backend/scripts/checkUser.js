const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const u = await prisma.user.findUnique({ where: { email: 'demo@haypbooks.test' } })
    console.log('User:', u)
  } catch (e) {
    console.error('ERR', e)
  } finally {
    await prisma.$disconnect()
  }
})()
