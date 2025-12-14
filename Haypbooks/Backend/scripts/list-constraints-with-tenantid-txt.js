const { Client } = require('pg')
;(async ()=>{
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'})
  await c.connect()
  const res = await c.query(`SELECT conname, conrelid::regclass::text AS table_name, confrelid::regclass::text AS referenced_table, convalidated, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE pg_get_constraintdef(oid) ILIKE '%tenantId_txt%';`)
  res.rows.forEach(r => console.log(r.conname, '->', r.table_name, 'refs', r.referenced_table, 'def', r.def))
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
