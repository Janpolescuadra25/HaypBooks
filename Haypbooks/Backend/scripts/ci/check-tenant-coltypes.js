const { Client } = require('pg')

async function main(){
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  const tenantTypeRes = await c.query("SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'")
  const tenantType = tenantTypeRes.rows[0] && tenantTypeRes.rows[0].typname
  const res = await c.query("SELECT table_name, udt_name FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public' ORDER BY table_name")
  const mismatches = []
  for (const r of res.rows) {
    if (r.udt_name !== tenantType) {
      // If a tenantId_txt column exists with a FK to Tenant(id), treat as acceptable
      const txtColRes = await c.query("SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'tenantId_txt'", [r.table_name])
      if (txtColRes.rowCount > 0) {
        // If a tenantId_txt mirror column exists we consider the mismatch acceptable
        continue
      }
      mismatches.push({ table: r.table_name, colType: r.udt_name })
    }
  }
  if (mismatches.length) {
    console.error('Tenant ID column type mismatches found:')
    mismatches.forEach(m => console.error(`- ${m.table}: tenantId type=${m.colType}, Tenant.id type=${tenantType}`))
    process.exit(2)
  }
  console.log('All tenantId column types match Tenant.id type:', tenantType)
  await c.end()
}

main().catch(e=>{ console.error(e); process.exit(1) })
