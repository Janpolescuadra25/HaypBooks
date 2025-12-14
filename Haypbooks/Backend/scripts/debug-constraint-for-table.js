const { Client } = require('pg')
const table = process.argv[2] || 'Budget'
;(async ()=>{
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'})
  await c.connect()
  const res = await c.query(`SELECT conname, convalidated, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid::regclass::text = $1::text AND contype='f'`, [table])
  res.rows.forEach(r => console.log(r.conname, 'VALIDATED:', r.convalidated, 'DEF:', r.def))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
