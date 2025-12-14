describe('Accounting process summary API', () => {
  test('returns 403 when reports:read is forbidden', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'guest',
      hasPermission: () => false,
    }))

    const { GET } = await import('@/app/api/accounting/process/summary/route')
    const res: any = await GET(new Request('http://localhost/api/accounting/process/summary'))
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

    const { GET } = await import('@/app/api/accounting/process/summary/route')
    const res: any = await GET(new Request('http://localhost/api/accounting/process/summary'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('asOf')
    expect(body).toHaveProperty('period')
    expect(body).toHaveProperty('ar')
    expect(body).toHaveProperty('ap')
    expect(body).toHaveProperty('receipts')
    expect(body).toHaveProperty('gl')
    expect(body).toHaveProperty('settings')
    expect(typeof body.gl.trialBalanceBalanced).toBe('boolean')
  })
})
