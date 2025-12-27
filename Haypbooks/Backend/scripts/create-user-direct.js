const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function main() {
  const prisma = new PrismaClient()
  const password = 'DemoPass!23'
  const hash = await bcrypt.hash(password, 10)
  try {
    const u = await prisma.user.create({
      data: {
        email: `direct-node-${Date.now()}@haypbooks.test`,
        password: hash,
        name: 'Direct Create Test',
        phone: '+15550001234'
      }
    })
    console.log('CREATED', u)
  } catch (err) {
    console.error('ERROR', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
