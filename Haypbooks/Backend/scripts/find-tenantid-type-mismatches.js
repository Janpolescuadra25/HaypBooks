const { Client } = require('pg')

async function main(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' })
  await c.connect()
  const res = await c.query("SELECT table_schema, table_name, column_name, udt_name FROM information_schema.columns WHERE column_name = 'tenantId' AND table_schema = 'public' ORDER BY table_name")
  for (const row of res.rows) {
    console.log(`${row.table_name}: tenantId type = ${row.udt_name}`)
  }
  // determine tenant.id type
  const t = await c.query("SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'")
  console.log('Tenant.id type:', t.rows[0] && t.rows[0].typname)
  await c.end()
}

main().catch(e=>{console.error(e);process.exit(1)})
