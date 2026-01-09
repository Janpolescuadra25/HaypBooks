const { Client } = require('pg')

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const cols = [
    'businessType','industry','startDate','country','address','taxId','vatRegistered','vatRate','pricesInclusive','taxFilingFrequency','taxExempt','logoUrl','invoicePrefix','defaultPaymentTerms','accountingMethod'
  ]

  const res = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'Tenant' AND column_name = ANY($1)`,
    [cols]
  )

  if (res.rows.length === 0) {
    console.log('✅ No deprecated onboarding columns found on Tenant.')
    await client.end()
    process.exit(0)
  } else {
    console.error('❌ Found deprecated columns on Tenant:')
    for (const r of res.rows) console.error('  -', r.column_name)
    await client.end()
    process.exit(2)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})