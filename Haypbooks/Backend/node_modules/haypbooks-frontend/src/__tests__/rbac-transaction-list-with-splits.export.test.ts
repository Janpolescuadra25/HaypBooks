import { setRoleOverride } from '@/lib/rbac'
import { GET as TLWS_EXP } from '@/app/api/reports/transaction-list-with-splits/export/route'

const req = (u: string) => new Request(u)

describe('RBAC: Transaction List with Splits CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await TLWS_EXP(req('http://localhost/api/reports/transaction-list-with-splits/export?end=2025-09-04'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and shapes filename', async () => {
    setRoleOverride('viewer')
    const end = '2025-09-04'
    const res: any = await TLWS_EXP(req(`http://localhost/api/reports/transaction-list-with-splits/export?end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`transaction-list-with-splits-asof-${end}`)
  })
})
