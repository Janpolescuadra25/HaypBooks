// RBAC: Reconciliation CSV exports must require reports:read

describe('RBAC: Reconciliation CSV exports', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('summary export denies when lacking reports:read', async () => {
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'guest',
      hasPermission: () => false,
    }))
    const { GET } = await import('@/app/api/reconciliation/summary/export/route')
    const res: any = await GET(new Request('http://localhost/api/reconciliation/summary/export'))
    expect(res.status).toBe(403)
  })

  test('progress-by-account export denies when lacking reports:read', async () => {
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'guest',
      hasPermission: () => false,
    }))
    const { GET } = await import('@/app/api/reconciliation/progress-by-account/export/route')
    const res: any = await GET(new Request('http://localhost/api/reconciliation/progress-by-account/export'))
    expect(res.status).toBe(403)
  })
})
