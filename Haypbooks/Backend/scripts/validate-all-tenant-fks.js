const { Client } = require('pg')
const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async function(){
  const c = new Client({ connectionString: connection })
  await c.connect()
  const res = await c.query(`SELECT conname, conrelid::regclass::text AS table_name FROM pg_constraint WHERE contype='f' AND confrelid = 'public."Tenant"'::regclass AND NOT convalidated ORDER BY conname`)
  console.log('Found', res.rowCount, 'unvalidated tenant FKs')
  for (const r of res.rows) {
    try {
      console.log('Validating', r.conname, 'on table', r.table_name)
      await c.query(`ALTER TABLE ${r.table_name} VALIDATE CONSTRAINT "${r.conname}"`)
      console.log('  ✅ Validated', r.conname)
    } catch (e) {
      console.error('  ❌ Failed to validate', r.conname, ':', e.message.split('\n')[0])
    }
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
