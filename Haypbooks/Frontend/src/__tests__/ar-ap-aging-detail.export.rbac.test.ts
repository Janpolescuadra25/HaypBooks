import { setRoleOverride } from '@/lib/rbac'

describe('Aging Detail export RBAC', () => {
  afterEach(() => setRoleOverride(undefined as any))
  test('returns 403 without reports:read permission', async () => {
    const { GET: GET_AR_EXPORT } = await import('@/app/api/reports/ar-aging-detail/export/route')
    const { GET: GET_AP_EXPORT } = await import('@/app/api/reports/ap-aging-detail/export/route')

    // Simulate a role without reports:read
    setRoleOverride('no-reports' as any)
    const resAr: any = await GET_AR_EXPORT(new Request('http://localhost/api/reports/ar-aging-detail/export'))
    const resAp: any = await GET_AP_EXPORT(new Request('http://localhost/api/reports/ap-aging-detail/export'))

    expect(resAr.status).toBe(403)
    expect(resAp.status).toBe(403)
  })
})
