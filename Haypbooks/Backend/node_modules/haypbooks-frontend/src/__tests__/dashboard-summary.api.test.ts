describe('Dashboard summary API', () => {
  test('returns 403 when reports:read is forbidden', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'guest',
      hasPermission: () => false,
    }))

    const { GET } = await import('@/app/api/dashboard/summary/route')
    const res: any = await GET(new Request('http://localhost/api/dashboard/summary'))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden' })
  })

  test('returns summary shape when allowed', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'admin',
      hasPermission: () => true,
    }))

    const { GET } = await import('@/app/api/dashboard/summary/route')
    const res: any = await GET(new Request('http://localhost/api/dashboard/summary'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('period')
    expect(body).toHaveProperty('start')
    expect(body).toHaveProperty('end')
    expect(body).toHaveProperty('kpis')
    expect(body.kpis).toHaveProperty('revenue')
    expect(body.kpis).toHaveProperty('expenses')
    expect(body.kpis).toHaveProperty('netIncome')
    expect(body.kpis).toHaveProperty('cash')
    expect(body.kpis).toHaveProperty('ar')
    expect(body.kpis).toHaveProperty('ap')
    expect(Array.isArray(body.recentTransactions)).toBe(true)
  })
})
