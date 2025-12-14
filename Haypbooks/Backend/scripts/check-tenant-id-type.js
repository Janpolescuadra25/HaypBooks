const { Client } = require('pg')
async function main(){
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  const r = await c.query(`SELECT pg_type.typname FROM pg_attribute JOIN pg_class ON pg_attribute.attrelid = pg_class.oid JOIN pg_type ON pg_attribute.atttypid = pg_type.oid WHERE pg_class.relname = 'Tenant' AND pg_attribute.attname = 'id'`)
  console.log('Tenant.id type:', r.rows[0] && r.rows[0].typname)
  await c.end()
}
main().catch(e=>{console.error(e);process.exit(1)})
