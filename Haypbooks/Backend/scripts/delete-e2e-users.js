const { PrismaClient } = require('@prisma/client')
; (async ()=>{
  const prisma = new PrismaClient()
  try {
    const emails = [
      'e2e-owner-1767548447478@haypbooks.test',
      'e2e-acct-1767548447478@haypbooks.test'
    ]
    const res = await prisma.user.deleteMany({ where: { email: { in: emails } } })
    console.log('Deleted users count:', res.count)
  } catch (e) {
    console.error('delete failed', e)
    process.exitCode = 2
  } finally {
    await prisma.$disconnect()
  }
})()
