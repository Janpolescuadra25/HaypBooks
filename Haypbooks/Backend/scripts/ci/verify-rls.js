const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db'
  const sqlPath = path.resolve(__dirname, '..', '..', '..', '..', 'LOgic.documentation', 'Documentation', 'Grok', 'scripts', 'db', 'verify-rls.psql')

  if (!fs.existsSync(sqlPath)) {
    console.error('verify-rls SQL file not found:', sqlPath)
    process.exit(2)
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')
  const client = new Client({ connectionString: databaseUrl })
  try {
    await client.connect()
    console.log('Connected to DB, running RLS verification...')
    await client.query(sql)
    console.log('RLS verification script completed successfully.')
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('RLS verification failed:', err.message)
    try { await client.end() } catch (e) {}
    process.exit(1)
  }
}

main()
