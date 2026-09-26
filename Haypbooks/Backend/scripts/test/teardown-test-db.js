#!/usr/bin/env node
const { Client } = require('pg')

const args = process.argv.slice(2)
const schemaArg = args.find(a => a.startsWith('--schema='))
const workerId = process.env.JEST_WORKER_ID
let targetSchema = null

if (schemaArg) {
  targetSchema = schemaArg.split('=')[1]
} else if (process.env.TEST_SCHEMA) {
  targetSchema = process.env.TEST_SCHEMA
} else if (workerId) {
  targetSchema = 	est_worker_
}

if (!targetSchema || targetSchema === 'public') {
  console.log('[teardown-test-db] No disposable worker schema specified. Skipping teardown.')
  process.exit(0)
}

const RAW_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
const urlObj = new URL(RAW_URL)
urlObj.searchParams.delete('schema')
const BASE_DATABASE_URL = urlObj.toString()

async function teardown() {
  console.log([teardown-test-db] Dropping disposable schema: ...)
  const client = new Client({ connectionString: BASE_DATABASE_URL })
  try {
    await client.connect()
    await client.query(DROP SCHEMA IF EXISTS "" CASCADE;)
    console.log([teardown-test-db] Successfully dropped schema ''. Cleanup complete.)
  } catch (err) {
    console.warn([teardown-test-db] Warning during schema cleanup: )
  } finally {
    await client.end()
  }
}

teardown()