const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const r = await c.query("SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_uuid_old' AND table_schema='public'")
  console.log('Remaining tenantId_uuid_old columns:', r.rows.map(r=>r.table_name))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
