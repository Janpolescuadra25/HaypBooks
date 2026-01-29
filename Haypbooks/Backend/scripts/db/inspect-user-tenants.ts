import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const argv = process.argv.slice(2)
const userId = argv[0] || process.env.USER_ID
if (!userId) {
  console.error('Usage: ts-node scripts/db/inspect-user-tenants.ts <userId> or set USER_ID env var')
  process.exit(2)
}

async function run() {
  console.info('[INSPECT-USER] userId=', userId)
  const tenantUsers: any = await prisma.workspaceUser.findMany({ where: { userId } })
  console.info('[INSPECT-USER] tenantUser rows:', tenantUsers)

  const tenantIds = tenantUsers.map((t: any) => t.tenantId).filter(Boolean)
  if (tenantIds.length) {
    const companies = await prisma.company.findMany({ where: { workspaceId: { in: tenantIds } }, select: { id: true, name: true, workspaceId: true } })
    console.info('[INSPECT-USER] companies for user tenants:', companies)
  } else {
    console.info('[INSPECT-USER] no tenant memberships found for user')
  }

  await prisma.$disconnect()
}

run().catch((e) => { console.error(e); prisma.$disconnect() })