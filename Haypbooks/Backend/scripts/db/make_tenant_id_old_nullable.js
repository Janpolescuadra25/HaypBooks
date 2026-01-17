#!/usr/bin/env node
const { Client } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    await c.query('ALTER TABLE public."Tenant" ALTER COLUMN "id_old" DROP NOT NULL')
    console.log('Tenant.id_old now nullable (if column existed)')
  } catch (e) {
    console.error('Error:', e.message || e)
    process.exit(1)
  } finally {
    await c.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
