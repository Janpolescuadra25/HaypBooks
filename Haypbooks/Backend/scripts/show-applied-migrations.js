const { Client } = require('pg')
;(async ()=>{
  const c = new Client({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'})
  await c.connect()
  const res = await c.query('SELECT name, state, appliedAt FROM "SchemaMigration" ORDER BY appliedAt DESC LIMIT 50')
  res.rows.forEach(r => console.log(r))
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
