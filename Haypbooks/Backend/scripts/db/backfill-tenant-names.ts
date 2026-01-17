import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run') || argv.length === 0
const limitArgIndex = argv.indexOf('--limit')
const limit = limitArgIndex >= 0 && argv[limitArgIndex+1] ? Number(argv[limitArgIndex+1]) : Infinity

async function main() {
  console.info('[BACKFILL] Starting tenant name backfill', { dryRun, limit })
  const tenants = await prisma.tenant.findMany({ where: { name: null }, select: { id: true, createdAt: true }, orderBy: { createdAt: 'asc' }, take: limit })
  if (!tenants || tenants.length === 0) {
    console.info('[BACKFILL] No tenants require backfill')
    return
  }

  for (const t of tenants) {
    const short = t.id.split('-')[0]
    const newName = `Unnamed workspace ${short}`
    if (dryRun) {
      console.info('[BACKFILL] Dry-run: would set', { id: t.id, name: newName })
      continue
    }
    try {
      await prisma.tenant.update({ where: { id: t.id }, data: { name: newName } })
      console.info('[BACKFILL] Updated tenant', { id: t.id, name: newName })
    } catch (e) {
      console.error('[BACKFILL] Failed to update tenant', { id: t.id, err: e?.message || e })
    }
  }
}

main().catch((e) => console.error('[BACKFILL] Fatal', e)).finally(async () => await prisma.$disconnect())
