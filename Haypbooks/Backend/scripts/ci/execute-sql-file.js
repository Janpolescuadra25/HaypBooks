#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })
const { Client } = require('pg')

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error('Usage: node execute-sql-file.js <path-to-sql-file>')
    process.exit(1)
  }
  const file = args[0]
  const content = fs.readFileSync(file, 'utf-8')
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not set in environment')
    process.exit(1)
  }
  const client = new Client({ connectionString })
  await client.connect()

  try {
    console.log('Executing SQL file:', file)
    await client.query(content)
    console.log('Executed successfully')
  } catch (err) {
    console.error('Failed to execute SQL file:', err.message || err)
  } finally {
    await client.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
