import { GET as TLBD_EXP } from '@/app/api/reports/transaction-list-by-date/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Transaction List by Date CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await TLBD_EXP(makeReq('http://localhost/api/reports/transaction-list-by-date/export?end=2025-09-04'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and shapes filename', async () => {
    setRoleOverride('viewer')
    const end = '2025-09-04'
    const res: any = await TLBD_EXP(makeReq(`http://localhost/api/reports/transaction-list-by-date/export?end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`transaction-list-by-date-asof-${end}`)
  })
})
