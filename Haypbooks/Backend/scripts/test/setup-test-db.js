#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')

const cwd = path.resolve(__dirname, '..', '..')
const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DB
if (!process.env.DATABASE_URL) {
  console.warn('No DATABASE_URL in environment; falling back to default local test DB')
  process.env.DATABASE_URL = DATABASE_URL
}
const recreate = process.argv.includes('--recreate') || process.env.FORCE_RESET_DB === '1'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function run(cmd) {
  console.log(`> ${cmd}`)
  // Use the current process.env.DATABASE_URL at runtime, falling back to top-level DATABASE_URL
  const envForChild = { ...process.env, DATABASE_URL: (process.env.DATABASE_URL || DATABASE_URL) }
  execSync(cmd, { cwd, stdio: 'inherit', env: envForChild })
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
      // simple exponential backoff
      // eslint-disable-next-line no-await-in-loop
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoffMs)
      backoffMs *= 2
    }
  }
}

try {
  const initCmd = `node ./scripts/migrate/init-db.js ${recreate ? '--recreate' : ''}`.trim()
  runWithRetry(initCmd, 3, 500)
  // Ensure Prisma migrations are deployed non-interactively to the test DB (creates tables like EmailVerificationToken)
  try {
    runWithRetry('npx prisma migrate deploy --schema=prisma/schema.prisma', 3, 500)
    // Ensure Prisma client is generated for any ts-node scripts that require it during seeding/tests
    runWithRetry('npm run prisma:generate', 3, 500)
  } catch (e) {
    console.warn('Prisma migrate deploy/generate step failed (continuing):', e && e.message ? e.message : e)
  }
  // Fall back to running SQL migration files (idempotent) for compatibility with older setups
  runWithRetry('node ./scripts/migrate/run-sql.js', 3, 500)
  // Ensure tenantId columns are UUID and Task.archivedAt exists before seeding / applying RLS
  try {
    runWithRetry('node ./scripts/ensure_tenantid_uuid.js', 3, 500)
  } catch (e) {
    console.warn('ensure_tenantid_uuid failed (continuing):', e && e.message ? e.message : e)
  }
  if (!process.argv.includes('--no-seed')) {
    try {
      // Ensure onboarding columns and Company profile columns exist before seeding (idempotent)
      try {
        runWithRetry('node ./scripts/db/add-onboarding-tenant-columns.js', 3, 500)
      } catch (e) {
        console.warn('Adding onboarding tenant columns failed (continuing):', e && e.message ? e.message : e)
      }
        // Ensure Tenant.type exists (some developer/test DBs may miss this column)
        try {
          runWithRetry('node ./scripts/db/add_tenant_type.js', 3, 500)
        } catch (e) {
          console.warn('Adding tenant.type failed (continuing):', e && e.message ? e.message : e)
        }
      // Ensure tenantId columns and Task.archivedAt again post-seed (idempotent)
      try {
        runWithRetry('node ./scripts/ensure_tenantid_uuid.js', 3, 500)
      } catch (e) {
        console.warn('Post-seed ensure_tenantid_uuid failed (continuing):', e && e.message ? e.message : e)
      }

      // Ensure Company profile columns exist (idempotent)
      try {
        runWithRetry('node ./scripts/db/add-company-profile-columns.js', 3, 500)
      } catch (e) {
        console.warn('Adding Company profile columns failed (continuing):', e && e.message ? e.message : e)
      }
      // Ensure Company profile columns are present via pg client (more robust)
      try {
        runWithRetry('node ./scripts/db/ensure_company_profile_columns_pg.js', 3, 500)
      } catch (e) {
        console.warn('Ensuring Company profile columns via pg failed (continuing):', e && e.message ? e.message : e)
      }

      // Apply any manual schema additions (idempotent)
      try {
        runWithRetry('node ./scripts/apply-schema-additions.ts', 3, 500)
      } catch (e) {
        console.warn('Applying schema additions failed (continuing):', e && e.message ? e.message : e)
      }

      // Ensure EmailVerificationToken table exists (safety idempotent step)
      try {
        runWithRetry('node ./scripts/db/ensure_email_verification_token.js', 3, 500)
      } catch (e) {
        console.warn('Ensuring EmailVerificationToken table failed (continuing):', e && e.message ? e.message : e)
      }

      // Ensure legacy tenantId_old columns are nullable (avoid NOT NULL regressions from migrations)
      try {
        runWithRetry('node ./scripts/db/make_all_tenantid_old_nullable.js', 3, 500)
      } catch (e) {
        console.warn('Making tenantId_old nullable failed (continuing):', e && e.message ? e.message : e)
      }

      // Ensure trigger to backfill tenantId_old for TenantUser exists (idempotent)
      try {
        runWithRetry('node ./scripts/db/add_tenantuser_set_tenantid_old_trigger.js', 3, 500)
      } catch (e) {
        console.warn('Adding tenantuser tenantId_old trigger failed (continuing):', e && e.message ? e.message : e)
      }

      // If tenantId_new columns exist in the DB, ensure insertion-time triggers populate them from tenantId
      try {
        runWithRetry('node ./scripts/db/add_tenantid_new_triggers.js', 3, 500)
      } catch (e) {
        console.warn('Adding tenantId_new triggers failed (continuing):', e && e.message ? e.message : e)
      }

      // Backfill tenant onboarding fields into Company records (idempotent)
      try {
        runWithRetry('node ./scripts/db/backfill-tenant-to-company.js', 3, 500)
      } catch (e) {
        console.warn('Backfill tenant->company failed (continuing):', e && e.message ? e.message : e)
      }

      // After backfill, run schema assertion to ensure critical columns exist
      try {
        runWithRetry('node ./scripts/test/assert-schema.js', 3, 500)
      } catch (e) {
        console.error('Schema assertions failed (aborting):', e && e.message ? e.message : e)
        process.exit(1)
      }

      // After schema assertion, enable RLS policies needed by e2e tests (idempotent)
      try {
        runWithRetry('node ./scripts/test/enable-test-rls.js', 3, 500)
      } catch (e) {
        console.warn('Enabling test RLS policies failed (continuing):', e && e.message ? e.message : e)
      }
      // Quick DB assertions: ensure Task.archivedAt exists and at least one tenantId is uuid
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
  // Ensure legacy tenantId_old columns are nullable (avoid NOT NULL regressions from migrations)
  try {
    runWithRetry('node ./scripts/db/make_all_tenantid_old_nullable.js', 3, 500)
  } catch (e) {
    console.warn('Making tenantId_old nullable failed (continuing):', e && e.message ? e.message : e)
  }

  // Ensure trigger to backfill tenantId_old for TenantUser exists (idempotent)
  try {
    runWithRetry('node ./scripts/db/add_tenantuser_set_tenantid_old_trigger.js', 3, 500)
  } catch (e) {
    console.warn('Adding tenantuser tenantId_old trigger failed (continuing):', e && e.message ? e.message : e)
  }

  console.log('✅ Test DB setup complete')

  // Small health-check: ensure we can connect to the DB and run a simple query before returning.
  const pgCheckCmd = `node -e "(async ()=>{const { Client } = require('pg'); const c = new Client({ connectionString: process.env.DATABASE_URL }); try { await c.connect(); await c.query('SELECT 1'); await c.end(); console.log('pg-check: ok'); } catch(e) { console.error('pg-check: failed', e && e.message ? e.message : e); process.exit(2); }})()"`
  let pgAttempts = 0
  const pgMax = 5
  while (pgAttempts < pgMax) {
    try {
      console.log('> pg-check (attempt', pgAttempts + 1, 'of', pgMax + ')')
      execSync(pgCheckCmd, { cwd, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })
      break
    } catch (e) {
      pgAttempts++
      console.warn('pg-check failed:', e && e.message ? e.message : e)
      if (pgAttempts >= pgMax) {
        console.error('pg-check failed after retries; continuing but tests may experience transient connection errors')
        break
      }
      // small backoff
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200 * pgAttempts)
    }
  }
} catch (e) {
  console.error('✖ Test DB setup failed:', e && e.message ? e.message : e)
  process.exit(1)
}
// Verify subscription schema before returning (optional; set SKIP_SUBS_SCHEMA_VERIFY=1 to skip)
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