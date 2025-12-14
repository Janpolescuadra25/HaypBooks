const { Client } = require('pg')
const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()
  const n = 'TaxRate'
  const res = await c.query(`
    SELECT tc.constraint_name, kcu.column_name, rc.unique_constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'tenantId'
      AND (tc.table_name = $1 OR tc.table_name = $2)
      AND rc.unique_constraint_name IN (
        SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'Tenant' AND constraint_type IN ('PRIMARY KEY', 'UNIQUE')
      )
  `, [n.toLowerCase(), n])
  console.log(res.rows)
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
