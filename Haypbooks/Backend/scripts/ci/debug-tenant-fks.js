const { Client } = require('pg')
const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;
(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()
  const names = ['Budget','FixedAsset','FixedAssetCategory','TaxRate']
  for (const n of names) {
    const r = await c.query(`
      SELECT tc.constraint_name, pg_c.convalidated
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN pg_constraint pg_c ON pg_c.conname = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND (tc.table_name = $1 OR tc.table_name = $2)
        AND kcu.column_name = 'tenantId'
        AND pg_c.confrelid = (SELECT oid FROM pg_class WHERE relname = 'Tenant')
    `, [n.toLowerCase(), n])
    console.log(`\n${n}:`)
    console.log(r.rows)
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
