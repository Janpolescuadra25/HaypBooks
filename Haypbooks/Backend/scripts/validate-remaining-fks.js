const { Client } = require('pg')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()

  const unvalidated = [
    'SearchIndexedDoc_tenant_fkey',
    'SearchIndexingQueue_tenant_fkey',
    'TaxCodeAccount_tenant_fkey'
  ]

  for (const fk of unvalidated) {
    const table = fk.split('_tenant_fkey')[0]
    try {
      await c.query(`ALTER TABLE "${table}" VALIDATE CONSTRAINT "${fk}"`)
      console.log(`✅ Validated ${fk}`)
    } catch (e) {
      console.error(`❌ Failed to validate ${fk}:`, e.message)
    }
  }

  await c.end()
}

main().catch(e => { console.error(e); process.exit(1) })
