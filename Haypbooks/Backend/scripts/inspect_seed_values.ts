import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { subdomain: 'demo' } })
  const user = await prisma.user.findFirst({ where: { email: 'demo@haypbooks.test' } })
  const company = await prisma.company.findFirst({ where: { tenantId: tenant?.id } })
  console.log('tenant.id:', tenant?.id)
  console.log('user.id:', user?.id)
  console.log('company.id:', company?.id)
  await prisma.$disconnect()
}
main().catch(e=>{ console.error(e); process.exit(1) })