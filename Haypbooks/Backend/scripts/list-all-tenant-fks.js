const { Client } = require('pg')

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  const res = await c.query("SELECT conname, conrelid::regclass::text AS table_name FROM pg_constraint WHERE conname ILIKE '%tenant%fkey%';")
  res.rows.forEach(r => console.log(r.conname, '->', r.table_name))
  await c.end()
}

main().catch(e=>{console.error(e); process.exit(1)})
