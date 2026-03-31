const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return console.log('user not found')
  console.log('user:', user.id)
  try {
    const comps = await prisma.company.findMany({ where: { isActive: true, tenant: { users: { some: { userId: user.id, status: 'ACTIVE' } } } }, include: { tenant: true } })
    console.log('companies:', comps)
  } catch (e) {
    console.error('company findMany failed:', e?.message || e)
  } finally {
    await prisma.$disconnect()
  }
}

run(process.argv[2]).catch(e => console.error(e))
