const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const cols = ['trialEndsAt','trialUsed','maxCompanies']
    const res = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Workspace' AND column_name = ANY($1)`, cols)
    const found = (res || []).map(r => r.column_name || r.column_name)
    const missing = cols.filter(c => !found.includes(c))
    if (missing.length) {
      console.error('❌ Missing Workspace subscription/trial columns:', missing)
      process.exit(2)
    }

    // Ensure Subscription.trialEndsAt is absent
    const subCol = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Subscription' AND column_name = 'trialEndsAt'`)
    if (subCol && subCol.length) {
      console.error('❌ Subscription.trialEndsAt still present; should be removed')
      process.exit(2)
    }

    // If Subscription table exists, check for a UNIQUE index on companyId
    const tbl = await prisma.$queryRawUnsafe("SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Subscription'")
    if (tbl && tbl.length) {
      const idxs = await prisma.$queryRawUnsafe("SELECT indexname, indexdef FROM pg_indexes WHERE tablename='Subscription' AND indexdef ILIKE '%(\"companyId\")%'")
      const hasUnique = (idxs || []).some(i => (i.indexdef || '').toUpperCase().includes('CREATE UNIQUE INDEX'))
      if (!hasUnique) {
        console.error('❌ No UNIQUE index found on Subscription("companyId")')
        process.exit(2)
      }
    }

    console.log('✅ Subscription schema checks OK')
    process.exit(0)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(2) })