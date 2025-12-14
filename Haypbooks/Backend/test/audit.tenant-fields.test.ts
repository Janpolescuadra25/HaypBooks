import { execSync } from 'child_process'
import path from 'path'

describe('Tenant audit', () => {
  it('ensures no missing tenantId fields (audit script returns success)', () => {
    const script = path.resolve(__dirname, '../scripts/audit-tenant-fields.ts')
    // Run the audit script via ts-node; the script prints output but must exit 0
    const cmd = `npx ts-node "${script}"`
    const out = execSync(cmd, { stdio: 'pipe' }).toString()
    expect(out).toMatch(/Done\./)
  })
})
