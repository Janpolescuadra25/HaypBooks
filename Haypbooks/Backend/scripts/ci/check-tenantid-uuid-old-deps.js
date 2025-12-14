const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const tables = ['Budget','Employee','FixedAsset','FixedAssetCategory','PaySchedule','Paycheck','PayrollRun','PayrollRunEmployee','TaxRate']
  for (const t of tables) {
    const q = `
      SELECT
        n.nspname as schema, c.relname as table, a.attname as column,
        dep.refobjid::regclass::text as referenced_object, dep.classid::text as classid, dep.objid::text as objid, dep.objsubid
      FROM pg_catalog.pg_depend dep
      JOIN pg_catalog.pg_attribute a ON a.attrelid = dep.objid AND a.attnum = dep.objsubid
      JOIN pg_catalog.pg_class c ON c.oid = dep.objid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = $1 AND a.attname = 'tenantId_uuid_old'
    `
    const res = await c.query(q, [t])
    if (res.rowCount === 0) {
      console.log(`${t}: no dependencies found for tenantId_uuid_old`)
    } else {
      console.log(`${t}: dependencies found:`, res.rows)
    }
  }
  await c.end()
})().catch(e=>{ console.error('error', e.message); process.exit(1) })
