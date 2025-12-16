#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')

const cwd = path.resolve(__dirname, '..', '..')
const DATABASE_URL = process.env.DATABASE_URL
const recreate = process.argv.includes('--recreate') || process.env.FORCE_RESET_DB === '1'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function run(cmd) {
  console.log(`> ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })
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
  runWithRetry('node ./scripts/migrate/run-sql.js', 3, 500)
  if (!process.argv.includes('--no-seed')) {
    try {
      runWithRetry('npm run db:seed:dev', 3, 500)
    } catch (e) {
      console.warn('Skipping db:seed:dev due to error (possibly missing generated Prisma client):', e && e.message ? e.message : e)
    }
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
