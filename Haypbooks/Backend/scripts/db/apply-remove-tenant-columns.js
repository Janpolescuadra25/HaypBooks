const { Client } = require('pg')
const fs = require('fs')

async function main() {
  const sql = fs.readFileSync(__dirname + '/../../prisma/migrations/20260110_remove_tenant_onboarding_fields/migration.sql', 'utf8')
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    console.log('Applying tenant column drops...')
    await client.query('BEGIN')
    // split on semicolon and run statements individually to surface errors
    for (const stmt of sql.split(/;\s*$/m)) {
      const s = stmt.trim()
      if (!s) continue
      console.log('Executing:', s.split('\n')[0].slice(0, 200))
      await client.query(s)
    }
    await client.query('COMMIT')
    console.log('Done.')
  } catch (err) {
    console.error('Error applying SQL:', err.message)
    try { await client.query('ROLLBACK') } catch (e) {}
    process.exit(2)
  } finally {
    await client.end()
  }
}

main().catch(err => { console.error(err); process.exit(2) })