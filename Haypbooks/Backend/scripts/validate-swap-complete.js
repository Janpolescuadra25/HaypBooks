const { Client } = require('pg')

async function main(){
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  const tenantTypeRes = await c.query("SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'")
  const tenantType = tenantTypeRes.rows[0] && tenantTypeRes.rows[0].typname
  const res = await c.query("SELECT table_name, udt_name FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public' ORDER BY table_name")
  const failed = []
  for (const r of res.rows) {
    const t = r.table_name
    if (r.udt_name !== tenantType) {
      failed.push({table: t, type: r.udt_name})
      continue
    }
    // Check FK exists and is validated
    const fkRes = await c.query(`SELECT conname, convalidated FROM pg_constraint WHERE contype='f' AND conrelid::regclass::text = $1 AND pg_get_constraintdef(oid) ILIKE '%tenantId%'`, [t])
    if (fkRes.rowCount === 0) failed.push({table: t, reason: 'missing fk'})
    else {
      for (const fk of fkRes.rows) {
        if (!fk.convalidated) failed.push({table:t, fk: fk.conname, reason: 'fk not validated'})
      }
    }
  }
  if (failed.length) {
    console.error('Swap validation failed for the following:')
    failed.forEach(f => console.error('-', f))
    process.exit(2)
  }
  console.log('Swap validation: OK — all tenantId are text and have validated FKs')
  await c.end()
}

main().catch(e=>{console.error(e); process.exit(1)})

