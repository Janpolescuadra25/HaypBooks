const { Client } = require('pg')

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  const res = await c.query(`SELECT table_name FROM information_schema.columns WHERE column_name='tenantId_txt' ORDER BY table_name;`)
  res.rows.forEach(r => console.log(r.table_name))
  await c.end()
}

main().catch(e=>{console.error(e); process.exit(1)})
