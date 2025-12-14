const { Client } = require('pg')

const tables = [
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
  for (const t of tables) {
    try {
      const dtype = await c.query(`SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = $1 AND pg_attribute.attname = 'tenantId'`, [t])
      const typeName = dtype.rows.length ? dtype.rows[0].typname : 'MISSING'
      console.log(`${t}: tenantId column type = ${typeName}`)
      // sample non-uuid values (simple regex check)
      const bad = await c.query(`SELECT "tenantId" FROM public."${t}" WHERE "tenantId" IS NOT NULL AND ("tenantId"::text) !~ '^[0-9a-fA-F-]{36}$' LIMIT 5`)
      if (bad.rows.length) console.log(`  sample non-uuid tenantIds: ${bad.rows.map(r=>r.tenantId).join(', ')}`)
    } catch (err) {
      console.error(`Error inspecting ${t}:`, err.message)
    }
  }
  await c.end()
}

main().catch(e=>{console.error(e);process.exit(1)})
