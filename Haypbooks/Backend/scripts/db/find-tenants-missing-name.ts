import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.info('[DIAG] Checking for tenants with missing name...')
  const rows = await prisma.tenant.findMany({ where: { name: null }, select: { id: true, createdAt: true } })
  if (!rows || rows.length === 0) {
    console.info('[DIAG] OK: No tenants with missing name found')
  } else {
    console.warn('[DIAG] Found tenants with missing name', { count: rows.length })
    for (const r of rows) console.log(' -', r.id, r.createdAt)
  }
}

main().catch((e) => {
  console.error('[DIAG] Fatal', e)
}).finally(async () => {
  await prisma.$disconnect()
})