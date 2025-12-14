const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

async function main() {
  const connection = process.env.DATABASE_URL || DEFAULT_DB
  const c = new Client({ connectionString: connection })
  await c.connect()

  const migrationPath = path.resolve(__dirname, '..', '..', 'prisma', 'migrations', '20251214020000_swap_tenantid_txt_to_tenantid', 'migration.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('Applying swap migration...')
  await c.query(sql)
  console.log('✅ Swap migration applied successfully!')

  await c.end()
}

main().catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1) })
