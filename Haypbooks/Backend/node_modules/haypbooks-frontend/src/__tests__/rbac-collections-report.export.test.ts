import { GET as GET_EXPORT } from '@/app/api/reports/collections-report/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Collections Report CSV export', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('denies without reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/collections-report/export?end=2025-09-04'))
    expect(res.status).toBe(403)
    const body = await res.text()
    expect(body).toContain('Forbidden')
  })

  test('allows viewer and shapes filename', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/collections-report/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('collections-report-asof-2025-09-04')
  })
})
