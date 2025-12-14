const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test';

(async()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const res = await c.query("SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND indexdef ILIKE '%tenantId_uuid_old%' ORDER BY tablename,indexname;")
  console.log(JSON.stringify(res.rows, null, 2))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
