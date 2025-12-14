import { GET as TDBA_EXP } from '@/app/api/reports/transaction-detail-by-account/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Transaction Detail by Account CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await TDBA_EXP(makeReq('http://localhost/api/reports/transaction-detail-by-account/export?end=2025-09-04'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and shapes filename', async () => {
    setRoleOverride('viewer')
    const end = '2025-09-04'
    const res: any = await TDBA_EXP(makeReq(`http://localhost/api/reports/transaction-detail-by-account/export?end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`transaction-detail-by-account-asof-${end}`)
  })
})
