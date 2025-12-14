describe('RBAC: Collections Report JSON API 403', () => {
  test('returns 403 JSON when forbidden', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))

    const { GET } = await import('@/app/api/reports/collections-report/route')
    const res: any = await GET(new Request('http://localhost/api/reports/collections-report?end=2025-09-04'))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden' })
  })
})
