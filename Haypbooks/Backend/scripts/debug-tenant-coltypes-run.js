const { Client } = require('pg')
;(async ()=>{
  const c = new Client({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'})
  await c.connect()
  const tenantTypeRes = await c.query("SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'")
  const tenantType = tenantTypeRes.rows[0] && tenantTypeRes.rows[0].typname
  console.log('Tenant.id type:', tenantType)
  const res = await c.query("SELECT table_name, udt_name FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public' ORDER BY table_name")
  for (const r of res.rows) {
    if (r.udt_name !== tenantType) {
      console.log('Mismatch candidate:', r.table_name, r.udt_name)
      const txtColRes = await c.query("SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'tenantId_txt'", [r.table_name])
      console.log('  txtColExists:', txtColRes.rowCount)
      if (txtColRes.rowCount > 0) {
        const fkCheckRes = await c.query(`SELECT conname, conrelid::regclass::text AS table_name, confrelid::regclass::text AS referenced_table, convalidated, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE contype = 'f' AND conrelid::regclass::text = $1 AND pg_get_constraintdef(oid) ILIKE '%tenantId_txt%' AND confrelid::regclass::text ILIKE '%Tenant%'`, [r.table_name])
        console.log('  fkMatches:', fkCheckRes.rowCount)
        fkCheckRes.rows.forEach(r => console.log('    ', r))
      }
    }
  }
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
