const { Client } = require('pg')
const t = process.argv[2] || 'Account'
;(async ()=>{
  const c=new Client({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'})
  await c.connect()
  const res = await c.query("SELECT conname, convalidated, pg_get_constraintdef(oid) AS def, conrelid::regclass::text AS table_name FROM pg_constraint WHERE conrelid::regclass::text = $1 AND contype = 'f'", [t])
  res.rows.forEach(r => console.log(r))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
