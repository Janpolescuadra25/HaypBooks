const { Client } = require('pg')
;(async ()=>{
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' })
  await c.connect()
  const res = await c.query("SELECT table_name, array_agg(column_name) cols FROM information_schema.columns WHERE table_schema='public' AND column_name IN ('tenantId','tenantId_new','tenantId_old') GROUP BY table_name ORDER BY table_name")
  for (const r of res.rows) {
    console.log(r.table_name, r.cols)
  }
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
