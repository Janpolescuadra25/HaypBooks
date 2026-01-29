import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: ts-node test-companies-query.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.log('User not found')
    process.exit(0)
  }
  const tenantUsers = await prisma.workspaceUser.findMany({ where: { userId: user.id }, select: { workspaceId: true } })
  const tenantIds = tenantUsers.map(t => t.tenantId)
  console.log('tenantIds:', tenantIds)

  for (const tid of tenantIds) {
    const sql = `SELECT c.id, c."tenantId", c.name, c."createdAt", COALESCE(t."workspaceName", t.name) AS "tenantWorkspaceName" FROM public."Company" c LEFT JOIN public."Tenant" t ON t.id = c."tenantId" WHERE c."tenantId" = '${tid}'::uuid` 
    console.log('sql:', sql)
    try {
      const rows = await prisma.$queryRawUnsafe(sql)
      console.log('rows for', tid, rows)
    } catch (e) {
      console.error('error for', tid, e?.message || e)
    }
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })