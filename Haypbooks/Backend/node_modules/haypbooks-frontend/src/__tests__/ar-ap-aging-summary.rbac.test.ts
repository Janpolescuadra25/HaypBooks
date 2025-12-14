describe('RBAC: Aging Summary APIs and Exports', () => {
  test('AR/AP aging JSON endpoints return 403 without reports:read', async () => {
    jest.resetModules()
    // Mock server RBAC so route handlers (which import rbac-server) see denied permissions
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))

    const { GET: GET_AR } = await import('@/app/api/reports/ar-aging/route')
    const resAr: any = await GET_AR(new Request('http://localhost/api/reports/ar-aging'))
    expect(resAr.status).toBe(403)

    const { GET: GET_AP } = await import('@/app/api/reports/ap-aging/route')
    const resAp: any = await GET_AP(new Request('http://localhost/api/reports/ap-aging'))
    expect(resAp.status).toBe(403)
  })

  test('AR/AP aging CSV export endpoints return 403 without reports:read', async () => {
    jest.resetModules()
    // Mock server RBAC so route handlers (which import rbac-server) see denied permissions
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))

    const { GET: GET_AR_EXPORT } = await import('@/app/api/reports/ar-aging/export/route')
    const resAr: any = await GET_AR_EXPORT(new Request('http://localhost/api/reports/ar-aging/export'))
    expect(resAr.status).toBe(403)

    const { GET: GET_AP_EXPORT } = await import('@/app/api/reports/ap-aging/export/route')
    const resAp: any = await GET_AP_EXPORT(new Request('http://localhost/api/reports/ap-aging/export'))
    expect(resAp.status).toBe(403)
  })
})
