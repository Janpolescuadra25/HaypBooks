const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const email = 'studio-test+1@haypbooks.test'
    const row = await prisma.otp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    console.log('OTP row:', row)
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
})()
