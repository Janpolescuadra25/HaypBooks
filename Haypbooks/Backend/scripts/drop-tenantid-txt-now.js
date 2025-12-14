const { Client } = require('pg')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

;(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()

  const res = await c.query(`
    SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_txt' AND table_schema = 'public' ORDER BY table_name
  `)
  if (res.rowCount === 0) {
    console.log('No tenantId_txt columns present.')
    await c.end(); return
  }
  console.log('Dropping tenantId_txt from tables:', res.rows.map(r=>r.table_name).join(', '))
  for (const { table_name } of res.rows) {
    await c.query(`ALTER TABLE public."${table_name}" DROP COLUMN IF EXISTS "tenantId_txt";`)
  }
  console.log('Dropped tenantId_txt from all detected tables.')
  await c.end()
})().catch(e=>{ console.error('Drop failed:', e.message); process.exit(1) })
