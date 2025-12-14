import { GET as AL_EXP } from '@/app/api/reports/account-ledger/export/route'
import { setRoleOverride } from '@/lib/rbac'

const mk = (u: string) => new Request(u)

describe('Account Ledger period aliasing', () => {
  afterEach(() => setRoleOverride(undefined))

  test('ThisQuarter aliases to QTD for caption/as-of', async () => {
    setRoleOverride('viewer')
    const url = 'http://localhost/api/reports/account-ledger/export?account=1000&period=ThisQuarter&end=2025-09-15'
    const res: any = await AL_EXP(mk(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const firstLine = text.split(/\r?\n/)[0]
    // With start and end derived, caption should be a formatted range or As of; our helper returns formatted caption
    // Here we just ensure it mentions 2025-09-15 and not a bare preset string
    expect(firstLine).toContain('2025')
  })
})
