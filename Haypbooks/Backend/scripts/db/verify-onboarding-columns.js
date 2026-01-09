#!/usr/bin/env node
const { Client } = require('pg')
const expected = [
  'businessType',
  'industry',
  'startDate',
  'fiscalStart',
  'country',
  'address',
  'taxId',
  'vatRegistered',
  'vatRate',
  'pricesInclusive',
  'taxFilingFrequency',
  'taxExempt',
  'logoUrl',
  'invoicePrefix',
  'defaultPaymentTerms',
  'accountingMethod'
]

const conn = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async () => {
  const client = new Client({ connectionString: conn })
  try {
    await client.connect()
    const res = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='Tenant' AND column_name = ANY($1::text[])`,
      [expected]
    )
    const found = res.rows.map(r => r.column_name)
    const missing = expected.filter(c => !found.includes(c))

    console.log('DATABASE_URL:', conn)
    if (missing.length === 0) {
      console.log('✅ All onboarding Tenant columns are present')
      process.exit(0)
    } else {
      console.error('❌ Missing onboarding columns:', missing)
      process.exit(2)
    }
  } catch (e) {
    console.error('Error verifying columns:', e && e.message ? e.message : e)
    process.exit(3)
  } finally {
    try { await client.end() } catch(e){}
  }
})()
