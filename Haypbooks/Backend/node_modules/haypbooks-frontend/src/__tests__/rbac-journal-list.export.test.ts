import { GET as JRNL_EXP } from '@/app/api/reports/journal/export/route'
import { setRoleOverride } from '@/lib/rbac'

const makeReq = (url: string) => new Request(url)

describe('RBAC: Journal list CSV export', () => {
  afterEach(() => setRoleOverride(undefined))

  test('denies when lacking reports:read', async () => {
    setRoleOverride('no-reports' as any)
    const res: any = await JRNL_EXP(makeReq('http://localhost/api/reports/journal/export'))
    expect(res.status).toBe(403)
  })

  test('allows viewer and shapes filename (range/as-of)', async () => {
    setRoleOverride('viewer')
    const res1: any = await JRNL_EXP(makeReq('http://localhost/api/reports/journal/export?start=2025-09-01&end=2025-09-10'))
    expect(res1.status).toBe(200)
    const cd1 = res1.headers.get('Content-Disposition') as string
    expect(cd1).toContain('journal-2025-09-01_to_2025-09-10')

    const res2: any = await JRNL_EXP(makeReq('http://localhost/api/reports/journal/export?end=2025-09-04'))
    expect(res2.status).toBe(200)
    const cd2 = res2.headers.get('Content-Disposition') as string
    expect(cd2).toContain('journal-asof-2025-09-04')
  })
})
