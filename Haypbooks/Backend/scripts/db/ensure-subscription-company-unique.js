const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    // Check if Subscription table exists
    const tbl = await prisma.$queryRawUnsafe("SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Subscription'")
    if (!tbl || !tbl.length) {
      console.log('[DB] Subscription table not present; skipping index ensure')
      process.exit(0)
    }

    // Look for any index that references companyId
    const idxs = await prisma.$queryRawUnsafe("SELECT indexname, indexdef FROM pg_indexes WHERE tablename='Subscription' AND indexdef ILIKE '%(\"companyId\")%'")
    const hasUnique = (idxs || []).some(i => (i.indexdef || '').toUpperCase().includes('CREATE UNIQUE INDEX'))

    if (hasUnique) {
      console.log('[DB] UNIQUE index on Subscription("companyId") already exists')
      process.exit(0)
    }

    // Create a unique index safely
    try {
      await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS subscription_companyid_unique ON "Subscription" ("companyId")')
      console.log('[DB] Created UNIQUE index subscription_companyid_unique on Subscription(companyId)')
      process.exit(0)
    } catch (e) {
      console.error('[DB] Failed to create unique index on Subscription(companyId):', e?.message || e)
      process.exit(2)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(2) })
