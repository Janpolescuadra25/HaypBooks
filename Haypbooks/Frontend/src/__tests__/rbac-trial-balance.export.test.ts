import { GET as CSV_GET } from '@/app/api/reports/trial-balance/export/route'
import { setRoleOverride } from '@/lib/rbac-server'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Trial Balance CSV export', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('denies without reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await CSV_GET(makeReq('http://test/api/reports/trial-balance/export'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and includes as-of token in filename', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await CSV_GET(makeReq('http://test/api/reports/trial-balance/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('trial-balance-asof-2025-09-04')
  })
})
