const { Client } = require('pg')

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  const sql = `SELECT conname, conrelid::regclass::text AS table_name, convalidated, pg_get_constraintdef(oid) AS def
               FROM pg_constraint
               WHERE contype='f' AND confrelid = 'public."Tenant"'::regclass ORDER BY conname;`
  const res = await c.query(sql)
  res.rows.forEach(r => console.log(r.conname, '->', r.table_name, 'VALIDATED:', r.convalidated, 'DEF:', r.def))
  await c.end()
}

main().catch(e=>{console.error(e); process.exit(1)})
