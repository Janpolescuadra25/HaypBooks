#!/usr/bin/env node
const { Client } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'
  const client = new Client({ connectionString })
  await client.connect()
  try {
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'EmailVerificationToken' ORDER BY ordinal_position`)
    console.log('Columns:', res.rows)
  } catch (e) {
    console.error('Error inspecting columns:', e && e.message ? e.message : e)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch(e=>{ console.error(e); process.exit(1) })
