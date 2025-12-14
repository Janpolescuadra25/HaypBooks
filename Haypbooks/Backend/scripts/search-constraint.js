const { Client } = require('pg')
const name = process.argv[2] || 'Budget_tenant_txt_fkey'
;(async ()=>{
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'})
  await c.connect()
  const sql = `SELECT conname, conrelid::regclass::text AS table_name, confrelid::regclass::text AS referenced_table, convalidated, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname ILIKE $1`;
  const res = await c.query(sql, ['%' + name + '%'])
  res.rows.forEach(r => console.log(r))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
