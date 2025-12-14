describe('RBAC: Core financial statements JSON 403', () => {
  test('profit-loss, balance-sheet, cash-flow return 403 JSON when forbidden', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))

    const { GET: GET_PL } = await import('@/app/api/reports/profit-loss/route')
    const resPL: any = await GET_PL(new Request('http://localhost/api/reports/profit-loss'))
    expect(resPL.status).toBe(403)
    const bodyPL = await resPL.json()
    expect(bodyPL).toEqual({ error: 'Forbidden' })

    const { GET: GET_BS } = await import('@/app/api/reports/balance-sheet/route')
    const resBS: any = await GET_BS(new Request('http://localhost/api/reports/balance-sheet'))
    expect(resBS.status).toBe(403)
    const bodyBS = await resBS.json()
    expect(bodyBS).toEqual({ error: 'Forbidden' })

    const { GET: GET_CF } = await import('@/app/api/reports/cash-flow/route')
    const resCF: any = await GET_CF(new Request('http://localhost/api/reports/cash-flow'))
    expect(resCF.status).toBe(403)
    const bodyCF = await resCF.json()
    expect(bodyCF).toEqual({ error: 'Forbidden' })
  })

  test('P&L by Month and Quarter return 403 JSON when forbidden', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))

    const { GET: GET_PLM } = await import('@/app/api/reports/profit-loss-by-month/route')
    const resPLM: any = await GET_PLM(new Request('http://localhost/api/reports/profit-loss-by-month'))
    expect(resPLM.status).toBe(403)
    const bodyPLM = await resPLM.json()
    expect(bodyPLM).toEqual({ error: 'Forbidden' })

    const { GET: GET_PLQ } = await import('@/app/api/reports/profit-loss-by-quarter/route')
    const resPLQ: any = await GET_PLQ(new Request('http://localhost/api/reports/profit-loss-by-quarter'))
    expect(resPLQ.status).toBe(403)
    const bodyPLQ = await resPLQ.json()
    expect(bodyPLQ).toEqual({ error: 'Forbidden' })
  })
})
