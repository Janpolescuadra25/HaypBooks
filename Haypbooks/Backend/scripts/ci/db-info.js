const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const db = await c.query('SELECT current_database()')
  console.log('Current DB:', db.rows[0].current_database)
  const r = await c.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'TaxRate' AND column_name LIKE 'tenantId%'")
  console.log('TaxRate tenant columns:', r.rows)
  const all = await c.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE column_name LIKE 'tenantId%'")
  console.log('All tenant columns:', all.rows)
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
