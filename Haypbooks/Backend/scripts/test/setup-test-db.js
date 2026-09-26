#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
const { Client } = require('pg')

const cwd = path.resolve(__dirname, '..', '..')
const args = process.argv.slice(2)
const isRecreate = args.includes('--recreate')
const noSeed = args.includes('--no-seed')

// Detect worker schema
const schemaArg = args.find(a => a.startsWith('--schema='))
const workerId = process.env.JEST_WORKER_ID
let targetSchema = 'public'
if (schemaArg) {
  targetSchema = schemaArg.split('=')[1]
} else if (process.env.TEST_SCHEMA) {
  targetSchema = process.env.TEST_SCHEMA
} else if (workerId) {
  targetSchema = 	est_worker_
}

// Ensure base URL has no schema appended
const RAW_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
const urlObj = new URL(RAW_URL)
urlObj.searchParams.delete('schema')
const BASE_DATABASE_URL = urlObj.toString()

function buildSchemaUrl(baseUrl, schema) {
  const url = new URL(baseUrl)
  url.searchParams.set('schema', schema)
  return url.toString()
}

const DATABASE_URL = targetSchema !== 'public' ? buildSchemaUrl(BASE_DATABASE_URL, targetSchema) : BASE_DATABASE_URL

console.log([setup-test-db] Target schema: )
console.log([setup-test-db] Connection URL configured.)

async function setupSchema() {
  if (targetSchema !== 'public') {
    const client = new Client({ connectionString: BASE_DATABASE_URL })
    await client.connect()
    try {
      if (isRecreate) {
        console.log([setup-test-db] Dropping existing schema: ...)
        await client.query(DROP SCHEMA IF EXISTS "" CASCADE;)
      }
      console.log([setup-test-db] Creating schema: ...)
      await client.query(CREATE SCHEMA IF NOT EXISTS "";)
    } finally {
      await client.end()
    }
  }
}

async function run() {
  try {
    await setupSchema()

    const env = {
      ...process.env,
      DATABASE_URL: DATABASE_URL,
      NODE_ENV: 'test'
    }

    console.log('[setup-test-db] Deploying Prisma migrations to schema...')
    execSync('npx prisma migrate deploy', { cwd, env, stdio: 'inherit' })

    if (!noSeed) {
      console.log('[setup-test-db] Seeding test database schema...')
      try {
        execSync('npm run db:seed:dev', { cwd, env, stdio: 'inherit' })
      } catch (seedErr) {
        console.warn('[setup-test-db] Note: db:seed:dev warning, continuing...')
      }
    }

    console.log([setup-test-db] Schema '' ready for isolated test execution.)
  } catch (error) {
    console.error('[setup-test-db] Failed to set up test database schema:', error.message)
    process.exit(1)
  }
}

run()