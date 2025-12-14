#!/usr/bin/env node
const { execSync } = require('child_process')

function run(cmd) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

try {
  // verify expected schema and RLS
  run('npm run verify:expected-schema')
  // Run lightweight RLS detection (lists tables missing RLS policies)
  run('node scripts/ci/list-missing-rls.js')
  console.log('✅ DB drift checks passed')
} catch (e) {
  console.error('✖ DB drift checks failed:', e && e.message ? e.message : e)
  process.exit(1)
}
