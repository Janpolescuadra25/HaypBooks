const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  console.log('Dropping policy tenant_isolation_Employee if exists')
  await c.query('DROP POLICY IF EXISTS tenant_isolation_Employee ON public."Employee"')
  const r = await c.query("SELECT p.polname, pg_get_expr(p.polqual, p.polrelid) AS qual FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'Employee' AND p.polname LIKE 'tenant_isolation%'")
  console.log('Remaining policies for Employee:', JSON.stringify(r.rows, null, 2))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
