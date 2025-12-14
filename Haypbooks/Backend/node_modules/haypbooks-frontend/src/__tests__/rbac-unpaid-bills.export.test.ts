// RBAC: Unpaid Bills CSV export must require reports:read

describe('RBAC: Unpaid Bills CSV export', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('denies when lacking reports:read', async () => {
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'guest',
      hasPermission: () => false,
    }))
    const { GET } = await import('@/app/api/reports/unpaid-bills/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/unpaid-bills/export'))
    expect(res.status).toBe(403)
  })
})
