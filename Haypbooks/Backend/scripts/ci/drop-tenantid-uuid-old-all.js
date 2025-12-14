const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const res = await c.query("SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_uuid_old' AND table_schema='public'")
  for (const r of res.rows) {
    const tbl = r.table_name
    try {
      console.log('Dropping tenantId_uuid_old from', tbl)
      await c.query(`ALTER TABLE public."${tbl}" DROP COLUMN IF EXISTS "tenantId_uuid_old" CASCADE`)
      console.log('Dropped from', tbl)
    } catch (e) {
      console.error('Failed to drop from', tbl, e.message)
    }
  }
  const remain = await c.query("SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_uuid_old' AND table_schema='public'")
  console.log('Remaining', remain.rows.map(r=>r.table_name))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
