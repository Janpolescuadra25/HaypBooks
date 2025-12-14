const { Client } = require('pg')
const url = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'

async function main() {
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    const res = await client.query(`
      SELECT table_name FROM information_schema.columns
      WHERE lower(column_name) IN ('tenant_id','tenantid') AND table_schema = 'public'
      GROUP BY table_name
      HAVING NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = information_schema.columns.table_name
      )
    `)
    if (res.rows.length === 0) {
      console.log('No missing RLS policies detected.')
      process.exit(0)
    }
    console.log('Tables missing RLS policies:')
    res.rows.forEach(r => console.log('- ' + r.table_name))
    process.exit(1)
  } catch (err) {
    console.error('Error querying DB for missing RLS:', err.message)
    process.exit(2)
  } finally {
    await client.end()
  }
}

main()
