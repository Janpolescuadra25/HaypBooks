const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const res = await c.query(`SELECT p.polname, n.nspname as schema_name, c.relname as table_name, pg_get_expr(p.polqual, p.polrelid) AS qual, pg_get_expr(p.polwithcheck, p.polrelid) AS withcheck FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE (pg_get_expr(p.polqual, p.polrelid) ILIKE '%tenantId_uuid_old%') OR (pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%tenantId_uuid_old%')`)
  console.log('Found', res.rowCount, 'policies')
  for (const r of res.rows) {
    console.log('---', r.schema_name + '.' + r.table_name + ' => ' + r.polname)
    console.log('QUAL:', r.qual)
    console.log('WITH:', r.withcheck)
  }
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
