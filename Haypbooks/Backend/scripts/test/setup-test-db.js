#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')

const cwd = path.resolve(__dirname, '..', '..')
const argv = process.argv.slice(2)
const schemaArg = argv.find(arg => arg.startsWith('--schema='))
const workerId = process.env.JEST_WORKER_ID || process.env.TEST_WORKER_ID || '1'
const explicitSchema = schemaArg ? schemaArg.split('=')[1] : process.env.TEST_SCHEMA
const DEFAULT_DB = process.env.DEFAULT_DB || process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
const rawDatabaseUrl = process.env.DATABASE_URL || DEFAULT_DB
const baseUrl = new URL(rawDatabaseUrl)
baseUrl.searchParams.delete('schema')
const BASE_DATABASE_URL = baseUrl.toString()
const targetSchema = explicitSchema || `test_worker_${workerId}`
const schemaUrl = new URL(BASE_DATABASE_URL)
schemaUrl.searchParams.set('schema', targetSchema)
const DATABASE_URL = targetSchema && targetSchema !== 'public' ? schemaUrl.toString() : BASE_DATABASE_URL

process.env.DEFAULT_DB = process.env.DEFAULT_DB || BASE_DATABASE_URL
process.env.DATABASE_URL = DATABASE_URL
process.env.TEST_SCHEMA = targetSchema

const recreate = argv.includes('--recreate') || process.env.FORCE_RESET_DB === '1'
const noSeed = argv.includes('--no-seed')

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function run(cmd) {
  console.log(`> ${cmd}`)
  const envForChild = {
    ...process.env,
    DATABASE_URL,
    TEST_SCHEMA: targetSchema,
    DEFAULT_DB: BASE_DATABASE_URL,
  }
  execSync(cmd, { cwd, stdio: 'inherit', env: envForChild })
}

async function ensureSchema() {
  if (targetSchema === 'public') {
    return
  }

  const { Client } = require('pg')
  const client = new Client({ connectionString: BASE_DATABASE_URL })
  await client.connect()
  try {
    if (recreate) {
      console.log(`[setup-test-db] Dropping existing schema: ${targetSchema}...`)
      await client.query(`DROP SCHEMA IF EXISTS "${targetSchema}" CASCADE;`)
    }
    console.log(`[setup-test-db] Creating schema: ${targetSchema}...`)
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${targetSchema}";`)
  } finally {
    await client.end()
  }
}

function runWithRetry(cmd, maxAttempts = 3, backoffMs = 500) {
  let attempt = 0
  while (attempt < maxAttempts) {
    try {
      run(cmd)
      return
    } catch (e) {
      attempt++
      console.warn(`Command failed (attempt ${attempt}/${maxAttempts}): ${cmd}`)
      if (attempt >= maxAttempts) {
        console.error(`Giving up on command: ${cmd}`)
        throw e
      }
      console.log(`Retrying in ${backoffMs}ms...`)
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoffMs)
      backoffMs *= 2
    }
  }
}

async function main() {
  console.log(`[setup-test-db] Target schema: ${targetSchema}`)
  console.log(`[setup-test-db] Base database URL: ${BASE_DATABASE_URL}`)
  await ensureSchema()

  const initCmd = `node ./scripts/migrate/init-db.js ${recreate ? '--recreate' : ''}`.trim()
  runWithRetry(initCmd, 3, 500)

  try {
    runWithRetry('npx prisma migrate deploy --schema=prisma/schema.prisma', 3, 500)
  } catch (e) {
    console.warn('Prisma migrate deploy step failed (continuing):', e && e.message ? e.message : e)
  }

  runWithRetry('node ./scripts/migrate/run-sql.js', 3, 500)

  try {
    runWithRetry('node ./scripts/ensure_tenantid_uuid.js', 3, 500)
  } catch (e) {
    console.warn('ensure_tenantid_uuid failed (continuing):', e && e.message ? e.message : e)
  }

  if (!noSeed) {
    try {
      try {
        runWithRetry('node ./scripts/db/add-onboarding-tenant-columns.js', 3, 500)
      } catch (e) {
        console.warn('Adding onboarding tenant columns failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/add_tenant_type.js', 3, 500)
      } catch (e) {
        console.warn('Adding tenant.type failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/ensure_tenantid_uuid.js', 3, 500)
      } catch (e) {
        console.warn('Post-seed ensure_tenantid_uuid failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/add-company-profile-columns.js', 3, 500)
      } catch (e) {
        console.warn('Adding Company profile columns failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/ensure_company_profile_columns_pg.js', 3, 500)
      } catch (e) {
        console.warn('Ensuring Company profile columns via pg failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/apply-schema-additions.ts', 3, 500)
      } catch (e) {
        console.warn('Applying schema additions failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/ensure_email_verification_token.js', 3, 500)
      } catch (e) {
        console.warn('Ensuring EmailVerificationToken table failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/make_all_tenantid_old_nullable.js', 3, 500)
      } catch (e) {
        console.warn('Making tenantId_old nullable failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/add_tenantuser_set_tenantid_old_trigger.js', 3, 500)
      } catch (e) {
        console.warn('Adding tenantuser tenantId_old trigger failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/add_tenantid_new_triggers.js', 3, 500)
      } catch (e) {
        console.warn('Adding tenantId_new triggers failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/db/backfill-tenant-to-company.js', 3, 500)
      } catch (e) {
        console.warn('Backfill tenant->company failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/test/assert-schema.js', 3, 500)
      } catch (e) {
        console.error('Schema assertions failed (aborting):', e && e.message ? e.message : e)
        process.exit(1)
      }

      try {
        runWithRetry('node ./scripts/test/enable-test-rls.js', 3, 500)
      } catch (e) {
        console.warn('Enabling test RLS policies failed (continuing):', e && e.message ? e.message : e)
      }

      try {
        runWithRetry('node ./scripts/test/db-assertions.js', 3, 500)
      } catch (e) {
        console.error('DB assertions failed (aborting):', e && e.message ? e.message : e)
        process.exit(1)
      }
    } catch (e) {
      console.warn('Skipping db:seed:dev due to error (possibly missing generated Prisma client):', e && e.message ? e.message : e)
    }
  }

  try {
    runWithRetry('node ./scripts/db/make_all_tenantid_old_nullable.js', 3, 500)
  } catch (e) {
    console.warn('Making tenantId_old nullable failed (continuing):', e && e.message ? e.message : e)
  }

  try {
    runWithRetry('node ./scripts/db/add_tenantuser_set_tenantid_old_trigger.js', 3, 500)
  } catch (e) {
    console.warn('Adding tenantuser tenantId_old trigger failed (continuing):', e && e.message ? e.message : e)
  }

  console.log('✅ Test DB setup complete')

  const pgCheckCmd = `node -e "(async ()=>{const { Client } = require('pg'); const c = new Client({ connectionString: process.env.DATABASE_URL }); try { await c.connect(); await c.query('SELECT 1'); await c.end(); console.log('pg-check: ok'); } catch(e) { console.error('pg-check: failed', e && e.message ? e.message : e); process.exit(2); }})()"`
  let pgAttempts = 0
  const pgMax = 5
  while (pgAttempts < pgMax) {
    try {
      console.log('> pg-check (attempt', pgAttempts + 1, 'of', pgMax + ')')
      execSync(pgCheckCmd, { cwd, stdio: 'inherit', env: { ...process.env, DATABASE_URL, TEST_SCHEMA: targetSchema } })
      break
    } catch (e) {
      pgAttempts++
      console.warn('pg-check failed:', e && e.message ? e.message : e)
      if (pgAttempts >= pgMax) {
        console.error('pg-check failed after retries; continuing but tests may experience transient connection errors')
        break
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200 * pgAttempts)
    }
  }

  if (process.env.SKIP_SUBS_SCHEMA_VERIFY !== '1') {
    try {
      runWithRetry('npm run db:verify:subscription-schema', 2, 500)
    } catch (e) {
      console.error('Subscription schema verification failed (aborting):', e && e.message ? e.message : e)
      process.exit(1)
    }
  } else {
    console.log('SKIP_SUBS_SCHEMA_VERIFY=1 set — skipping subscription schema verification')
  }
}

main().catch((e) => {
  console.error('✖ Test DB setup failed:', e && e.message ? e.message : e)
  process.exit(1)
})
