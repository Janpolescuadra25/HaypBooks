import { GET as CB_D_GET } from '@/app/api/reports/customer-balance-detail/export/route'
import { GET as CB_S_GET } from '@/app/api/reports/customer-balance-summary/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Customer Balance CSV exports', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('detail denies without reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await CB_D_GET(makeReq('http://localhost/api/reports/customer-balance-detail/export'))
    expect(res.status).toBe(403)
  })

  test('summary denies without reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await CB_S_GET(makeReq('http://localhost/api/reports/customer-balance-summary/export'))
    expect(res.status).toBe(403)
  })

  test('detail allows viewer and shapes filename', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await CB_D_GET(makeReq('http://localhost/api/reports/customer-balance-detail/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('customer-balance-detail-asof-2025-09-04')
  })

  test('summary allows viewer and shapes filename', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await CB_S_GET(makeReq('http://localhost/api/reports/customer-balance-summary/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('customer-balance-summary-asof-2025-09-04')
  })
})
