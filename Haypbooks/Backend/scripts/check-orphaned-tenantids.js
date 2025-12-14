// Script to detect orphaned tenantId values in tables we added tenant FKs for
const { Client } = require('pg')

const tablesToCheck = [
  'TaxRate',
  'TaxCodeAccount',
  'SearchIndexingQueue',
  'SearchIndexedDoc',
  'Budget',
  'FixedAsset',
  'FixedAssetCategory'
]

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  for (const t of tablesToCheck) {
    try {
      const res = await c.query(`SELECT COUNT(*) AS cnt FROM public."${t}" t WHERE t."tenantId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" s WHERE s.id::text = t."tenantId"::text)`)
      console.log(`${t}: ${res.rows[0].cnt} orphaned rows.`)
    } catch (err) {
      console.error(`Error checking ${t}:`, err.message)
    }
  }
  await c.end()
}

main().catch(e => {
  console.error('Fatal:', e.stack || e)
  process.exit(1)
})
