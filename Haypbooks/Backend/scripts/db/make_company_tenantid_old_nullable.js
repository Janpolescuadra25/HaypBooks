#!/usr/bin/env node
const { Client } = require('pg')
const path = require('path')
// no dotenv; use explicit env DATABASE_URL set in test runs
;(async () => {
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    await c.query('ALTER TABLE public."Company" ALTER COLUMN "tenantId_old" DROP NOT NULL')
    console.log('Company.tenantId_old now nullable (if column existed)')
  } catch (e) {
    console.error('Error (ok if column missing):', e.message || e)
  } finally {
    await c.end()
  }
})().catch(e=>{console.error(e); process.exit(1)})
