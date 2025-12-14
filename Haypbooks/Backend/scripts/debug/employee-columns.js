const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' })
  await c.connect()
  const res = await c.query("SELECT column_name, is_nullable, udt_name, column_default FROM information_schema.columns WHERE table_name = 'Employee'")
  console.log(res.rows)
  await c.end()
})().catch(e => { console.error(e); process.exit(1) })
