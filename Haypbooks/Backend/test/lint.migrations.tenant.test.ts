import { execSync } from 'child_process'
import path from 'path'

describe('Migration lint for tenantId', () => {
  it('ensures migrations that add tenantId include index and FK and RLS', () => {
    const cmd = `node ./scripts/ci/migration-rls-lint.js`
    const out = execSync(cmd, { stdio: 'pipe' }).toString()
    expect(out).toMatch(/Migration RLS lint passed/) // extended script exits 0 only on pass
  })
})
