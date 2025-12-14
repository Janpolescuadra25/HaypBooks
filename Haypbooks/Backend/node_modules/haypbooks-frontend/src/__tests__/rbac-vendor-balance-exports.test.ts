import { GET as VB_D_GET } from '@/app/api/reports/vendor-balance-detail/export/route'
import { GET as VB_S_GET } from '@/app/api/reports/vendor-balance-summary/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Vendor Balance CSV exports', () => {
  afterEach(() => setRoleOverride(undefined))

  test('detail denies without reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await VB_D_GET(makeReq('http://localhost/api/reports/vendor-balance-detail/export'))
    expect(res.status).toBe(403)
  })

  test('summary denies without reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await VB_S_GET(makeReq('http://localhost/api/reports/vendor-balance-summary/export'))
    expect(res.status).toBe(403)
  })

  test('detail allows viewer and shapes filename', async () => {
    setRoleOverride('viewer')
    const res: any = await VB_D_GET(makeReq('http://localhost/api/reports/vendor-balance-detail/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('vendor-balance-detail-asof-2025-09-04')
  })

  test('summary allows viewer and shapes filename', async () => {
    setRoleOverride('viewer')
    const res: any = await VB_S_GET(makeReq('http://localhost/api/reports/vendor-balance-summary/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('vendor-balance-summary-asof-2025-09-04')
  })
})
