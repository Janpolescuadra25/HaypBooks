#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')

const BACKEND_DIR = path.resolve(__dirname, '..', '..')
const candidates = require('../db/list-rls-candidates')().slice(0, 50) // pick top candidates

try {
  console.log('Running Phase 2 apply (idempotent)')
  execSync('node ./scripts/db/add-tenant-indexes-phase2.js', { cwd: BACKEND_DIR, stdio: 'inherit' })
  execSync('node ./scripts/db/apply-rls-phase2.js', { cwd: BACKEND_DIR, stdio: 'inherit' })

  console.log('Checking for missing RLS on Phase 2 candidates')
  const missing = execSync('node ./scripts/ci/list-missing-rls.js --json', { cwd: BACKEND_DIR }).toString()
  const missingList = JSON.parse(missing)
  const stillMissing = candidates.filter(c => missingList.includes(c))
  if (stillMissing.length) {
    console.error('RLS not applied for Phase 2 candidates:', stillMissing)
    process.exit(2)
  }
  console.log('All Phase 2 candidates have RLS applied')
} catch (e) {
  console.error('verify-rls-phase2 failed:', e.message)
  process.exit(1)
}