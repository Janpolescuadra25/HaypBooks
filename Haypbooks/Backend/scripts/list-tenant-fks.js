const { Client } = require('pg')
const tableNames = [
  'TaxRate',
  'TaxCodeAccount',
  'SearchIndexingQueue',
  'SearchIndexedDoc',
  'Budget',
  'FixedAsset',
  'FixedAssetCategory',
  'TaxCode',
  'LineTax'
]

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  for (const t of tableNames) {
    const name = `${t}_tenant_fkey`
    const r = await c.query(`SELECT conname, contype FROM pg_constraint WHERE conname = $1`, [name])
    if (r.rows.length) console.log(`${t}: has FK ${name} (${r.rows[0].contype})`)
    else console.log(`${t}: NO FK named ${name}`)
  }
  await c.end()
}

main().catch(e => { console.error(e); process.exit(1) })
