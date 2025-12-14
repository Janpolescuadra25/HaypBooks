const { Client } = require('pg')

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' })
  await c.connect()
  const r = await c.query("SELECT COUNT(*) AS total, SUM(CASE WHEN id ~ '^[0-9a-fA-F-]{36}$' THEN 1 ELSE 0 END) AS uuids FROM public.\"Tenant\"")
  const total = parseInt(r.rows[0].total, 10)
  const uuids = parseInt(r.rows[0].uuids, 10)
  console.log(`Tenant.id: ${uuids}/${total} look like UUIDs`)
  if (uuids !== total) {
    console.log('Sample invalid Tenant.id values:')
    const bad = await c.query("SELECT id FROM public.\"Tenant\" WHERE id !~ '^[0-9a-fA-F-]{36}$' LIMIT 20")
    bad.rows.forEach(row => console.log(' -', row.id))
  }
  await c.end()
}

main().catch(e => { console.error(e); process.exit(1) })
