#!/usr/bin/env node
const { Client } = require('pg')
const path = require('path')
const dotenv = require('dotenv')
if (dotenv && typeof dotenv.config === 'function') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
}

(async function main(){
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not set in .env')
    process.exit(1)
  }

  const client = new Client({ connectionString })
  await client.connect()
  try {
    const q = `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User' OR table_name = '"User"'`;
    const res = await client.query(q)
    if (!res.rowCount) {
      console.error('No columns found for table User (maybe table not present)')
      process.exitCode = 2
    } else {
      console.table(res.rows)
      const cols = res.rows.map(r => r.column_name.toLowerCase())
      // required columns can be adjusted as needed
      const required = ['role', 'onboarding_mode']
      const missing = required.filter(c => !cols.includes(c))
      if (missing.length) {
        console.error('Schema check failed — missing columns:', missing.join(', '))
        process.exitCode = 3
      } else {
        console.log('Schema check OK — required columns present')
      }
    }
  } catch(err) {
    console.error('Query failed:', err.message || err)
    process.exitCode = 1
  } finally {
    await client.end()
    // ensure process exits with non-zero if we set exitCode
    if (process.exitCode && process.exitCode !== 0) process.exit(process.exitCode)
  }
})()
