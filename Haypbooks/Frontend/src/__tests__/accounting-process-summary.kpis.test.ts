describe('Accounting process summary API KPIs', () => {
  test('includes DSO/DPO KPI fields when allowed', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'admin',
      hasPermission: () => true,
    }))

    const { GET } = await import('@/app/api/accounting/process/summary/route')
    const res: any = await GET(new Request('http://localhost/api/accounting/process/summary'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('kpis')
    // dsoDays/dpoDays can be number or null depending on seeded data; assert presence and type validity
    expect(Object.prototype.hasOwnProperty.call(body.kpis, 'dsoDays')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(body.kpis, 'dpoDays')).toBe(true)
    if (body.kpis.dsoDays !== null) expect(typeof body.kpis.dsoDays).toBe('number')
    if (body.kpis.dpoDays !== null) expect(typeof body.kpis.dpoDays).toBe('number')
  })
})
