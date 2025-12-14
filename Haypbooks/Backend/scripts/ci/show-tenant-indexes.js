const { Client } = require('pg')

const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
const TABLES = ['TenantUser','TimesheetApproval','PaycheckLine']

;(async function main() {
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const q = `SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename = ANY($1::text[]) ORDER BY tablename, indexname;`
  const res = await c.query(q, [TABLES])
  console.log('pg_indexes for tenant tables:')
  for (const r of res.rows) {
    console.log(`- ${r.tablename}: ${r.indexname} -> ${r.indexdef}`)
  }
  await c.end()
})().catch(e => { console.error(e); process.exit(1) })
