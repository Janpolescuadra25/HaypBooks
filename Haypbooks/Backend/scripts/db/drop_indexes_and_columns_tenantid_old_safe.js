#!/usr/bin/env node
const { Client } = require('pg')
;(async ()=>{
  const safeTables = [
    'AccountBalance','SearchIndexingQueue','SearchIndexedDoc','ApiRateLimit','DsrExportRequest','ConsentRecord','IdempotencyKey','OutboxEvent','Class','Customer','FixedAssetCategory','Location','LineTax','OpeningBalance','Project','TaxCodeAccount','TenantBillingUsage','TenantBillingInvoice','Vendor'
  ]
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    for (const t of safeTables) {
      console.log(`\nProcessing ${t}`)
      // find indexes referencing tenantId_old
      const idxs = await c.query(`SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename=$1 AND indexdef ILIKE '%' || 'tenantId_old' || '%'`, [t])
      for (const idx of idxs.rows) {
        try {
          await c.query(`DROP INDEX IF EXISTS public."${idx.indexname}"`)
          console.log(`  Dropped index ${idx.indexname}`)
        } catch (e) { console.warn(`  Failed to drop index ${idx.indexname}:`, e.message) }
      }
      // try to drop column
      try {
        await c.query(`ALTER TABLE public."${t}" DROP COLUMN IF EXISTS "tenantId_old"`)
        console.log(`  Dropped tenantId_old from ${t}`)
      } catch (e) {
        console.warn(`  Failed to drop tenantId_old from ${t}:`, e.message)
      }
    }
    console.log('\nSafe index/column cleanup complete')
  } catch (e) { console.error(e); process.exit(1) } finally { await c.end() }
})().catch(e=>{ console.error(e); process.exit(1) })
