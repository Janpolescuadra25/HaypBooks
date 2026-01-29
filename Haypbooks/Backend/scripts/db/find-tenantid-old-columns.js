// Lists tables that still have a column named tenantId_old (often blockers in tenant conversions)
const { Client } = require('pg')

async function main() {
  const cliArg = process.argv[2]
  const connection = cliArg || process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const client = new Client({ connectionString: connection })
  await client.connect()

  const q = `
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE column_name = 'tenantId_old'
      AND table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY table_schema, table_name
  `

  const res = await client.query(q)
  if (res.rows.length === 0) {
    console.log('No tables with tenantId_old found in this database.')
  } else {
    console.log('Tables containing tenantId_old:')
    for (const r of res.rows) console.log(`- ${r.table_schema}.${r.table_name}`)
  }

  await client.end()
}

main().catch(err => {
  console.error(err.stack || err)
  process.exit(1)
})