const { Client } = require('pg')
const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()
  const names = ['Budget_tenant_fkey','Budget_tenantId_fkey']
  for (const n of names) {
    const r = await c.query('SELECT conname, convalidated, conrelid::regclass as table_name FROM pg_constraint WHERE conname = $1', [n])
    console.log(n, r.rows)
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
