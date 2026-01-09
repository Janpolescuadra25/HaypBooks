const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

async function main() {
  const prisma = new PrismaClient()
  try {
    const sql = fs.readFileSync(__dirname + '/../../prisma/migrations/20260110_per-company-subscriptions-and-tenant-trial/migration.sql', 'utf8')
    console.log('Applying per-company subscription migration SQL...')
    try {
      console.log('Executing the migration SQL as a single batch')
      await prisma.$executeRawUnsafe(sql)
      console.log('Done.')
    } catch (e) {
      // If the Subscription table is not present, some statements may fail (safe to continue)
      console.warn('Batch SQL execution returned an error; will attempt to proceed where possible:', e?.message)
      // Try to run statements individually, ignoring errors for missing relations
      for (const stmt of sql.split(/;\s*$/m)) {
        const s = stmt.trim()
        if (!s) continue
        try {
          console.log('Executing (fallback):', s.split('\n')[0].slice(0, 200))
          await prisma.$executeRawUnsafe(s)
        } catch (err) {
          console.warn('Statement failed (ignored):', err?.message)
        }
      }
    }

    // Now attempt to create a unique index on Subscription.companyId if the table exists
    try {
      const rows = await prisma.$queryRawUnsafe("SELECT 1 FROM pg_class WHERE relname='Subscription'")
      if (rows && rows.length) {
        console.log('Creating unique index on Subscription.companyId (if not present)')
        try {
          await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "subscription_companyid_unique" ON "Subscription" ("companyId")')
        } catch (err) {
          console.warn('Creating index failed (ignored):', err?.message)
        }
      } else {
        console.warn('Subscription table not present; skipping index creation')
      }
    } catch (err) {
      console.warn('Index existence check failed (ignored):', err?.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(2) })