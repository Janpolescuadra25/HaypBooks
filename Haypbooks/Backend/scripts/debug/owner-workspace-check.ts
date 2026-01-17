import { PrismaClient } from '@prisma/client'

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: ts-node owner-workspace-check.ts <email>')
    process.exit(2)
  }
  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log('No user found for', email)
      return
    }
    console.log('User:', { id: user.id, email: user.email, name: user.name })

    const tenantUsers = await prisma.tenantUser.findMany({ where: { userId: user.id } })
    console.log('TenantUser rows:', tenantUsers)

    const tenantIds = tenantUsers.map(tu => tu.tenantId)
    const tenants = await prisma.tenant.findMany({ where: { id: { in: tenantIds } }, select: { id: true, name: true } })
    console.log('Tenants:', tenants)

    const companies = await prisma.company.findMany({ where: { tenantId: { in: tenantIds } } })
    console.log('Companies under these tenants:', companies)

    // Also show owned filter result using the same logic as repo
    const owned = await prisma.company.findMany({
      where: {
        isActive: true,
        tenant: { users: { some: { userId: user.id, isOwner: true, status: 'ACTIVE' } } }
      }
    })
    console.log('Companies matching owned filter:', owned)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
