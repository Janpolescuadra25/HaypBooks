const { spawnSync } = require('child_process')

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts })
  if (res.status !== 0) {
    console.error(`ERROR: command failed: ${cmd} ${args.join(' ')}`)
    process.exit(res.status || 1)
  }
}

console.log('Running DB Ship checks...')

// 1. Migration RLS lint
run('npm', ['run', 'lint:migrations:rls'])

// 2. Tenant types lint
run('npm', ['run', 'lint:db:tenant-coltypes'])

// 2.5 Schema completeness lint
run('npm', ['run', 'lint:db:schema-complete'])
// 2.6 Schema required columns lint
run('npm', ['run', 'lint:db:schema-columns'])
// 2.7 Fail if any tenant backup columns are present
run('npm', ['run', 'lint:db:fail-on-backups'])
// 2.7 Verify expected schema is in sync
run('npm', ['run', 'verify:expected-schema'])

// 3. Seeds (smoke)
run('npm', ['run', 'db:seed:smoke'])

// 4. Validate DB (end-to-end validations: FK, types, audit, etc.)
run('node', ['./scripts/validate-database-complete.js'])

console.log('✅ All DB Ship checks passed.')