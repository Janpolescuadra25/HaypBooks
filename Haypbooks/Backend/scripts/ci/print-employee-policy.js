const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const r = await c.query("SELECT polname, pg_get_expr(polqual, polrelid) as qual, pg_get_expr(polwithcheck, polrelid) as withcheck, polpermissive, polcmd FROM pg_policy WHERE polname = 'tenant_isolation_Employee'")
  console.log('Result:', JSON.stringify(r.rows, null, 2))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
