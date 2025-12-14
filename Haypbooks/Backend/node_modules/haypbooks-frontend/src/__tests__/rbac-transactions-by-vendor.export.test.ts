import { GET as GET_EXPORT } from '@/app/api/reports/transactions-by-vendor/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Transactions by Vendor CSV export', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/transactions-by-vendor/export'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and includes filename token', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/transactions-by-vendor/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('transactions-by-vendor-asof-2025-09-04')
  })
})
