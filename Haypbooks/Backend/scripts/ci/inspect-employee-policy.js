const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const r = await c.query("SELECT p.oid, p.polname, p.polrelid, n.nspname, c.relname, pg_get_expr(p.polqual, p.polrelid) AS qual FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname = 'Employee' AND p.polname LIKE 'tenant_isolation%';")
  console.log(JSON.stringify(r.rows, null, 2))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
