#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')

const cwd = path.resolve(__dirname, '..', '..')
const DATABASE_URL = process.env.DATABASE_URL
const recreate = process.argv.includes('--recreate') || process.env.FORCE_RESET_DB === '1'

function run(cmd) {
  console.log(`> ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })
}

try {
  const initCmd = `node ./scripts/migrate/init-db.js ${recreate ? '--recreate' : ''}`.trim()
  run(initCmd)
  run('node ./scripts/migrate/run-sql.js')
  if (!process.argv.includes('--no-seed')) {
    run('npm run db:seed:dev')
  }
  console.log('✅ Test DB setup complete')
} catch (e) {
  console.error('✖ Test DB setup failed:', e && e.message ? e.message : e)
  process.exit(1)
}
