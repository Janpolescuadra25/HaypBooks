import { GET as AL_EXP } from '@/app/api/reports/account-ledger/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Account Ledger CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await AL_EXP(makeReq('http://localhost/api/reports/account-ledger/export?account=1000'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and shapes filename with account token (as-of)', async () => {
    setRoleOverride('viewer')
    const res: any = await AL_EXP(makeReq('http://localhost/api/reports/account-ledger/export?account=1000&end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('account-ledger-asof-2025-09-04_1000')
  })
})
