import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const argv = process.argv.slice(2)
const userId = argv[0]
const tenantId = argv[1]
const apply = argv.includes('--apply')

if (!userId || !tenantId) {
  console.error('Usage: ts-node scripts/db/deactivate-tenantuser.ts <userId> <tenantId> [--apply]')
  process.exit(2)
}

async function run() {
  console.info('[DEACTIVATE] userId=', userId, 'tenantId=', tenantId, 'apply=', apply)
  const rows: any = await prisma.tenantUser.findMany({ where: { userId, tenantId } })
  console.info('[DEACTIVATE] Found tenantUser rows:', rows)
  if (!rows || rows.length === 0) {
    console.info('[DEACTIVATE] Nothing to do')
    await prisma.$disconnect()
    return
  }

  if (!apply) {
    console.info('[DEACTIVATE] Dry-run: to apply the soft-deactivation run with --apply')
    await prisma.$disconnect()
    return
  }

  const res = await prisma.tenantUser.updateMany({ where: { userId, tenantId }, data: { status: 'INACTIVE', deletedAt: new Date() } })
  console.info('[DEACTIVATE] Updated rows:', res)
  await prisma.$disconnect()
}

run().catch((e)=>{ console.error(e); prisma.$disconnect() })