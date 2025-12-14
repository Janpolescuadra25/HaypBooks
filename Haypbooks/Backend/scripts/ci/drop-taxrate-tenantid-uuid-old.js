const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  try {
    await c.query('ALTER TABLE public."TaxRate" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE')
    console.log('Dropped TaxRate tenantId_uuid_old')
  } catch (e) { console.error('Drop failed:', e.message) }
  const r = await c.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_name = 'TaxRate' AND column_name LIKE 'tenantId%'")
  console.log('TaxRate cols after drop:', r.rows)
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
