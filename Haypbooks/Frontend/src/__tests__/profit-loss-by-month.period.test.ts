describe('Profit & Loss by Month API - period parameter', () => {
  test('returns different ranges for LastMonth vs YTD', async () => {
    const { GET } = await import('@/app/api/reports/profit-loss-by-month/route')
    const resYtd: any = await GET(new Request('http://localhost/api/reports/profit-loss-by-month?period=YTD'))
    const dataYtd = await resYtd.json()
    const resLm: any = await GET(new Request('http://localhost/api/reports/profit-loss-by-month?period=LastMonth'))
    const dataLm = await resLm.json()

    expect(dataYtd.period).toBe('YTD')
    expect(dataLm.period).toBe('LastMonth')
    // YTD should include more months than LastMonth (typically > 1 vs 1)
    expect(Array.isArray(dataYtd.months)).toBe(true)
    expect(Array.isArray(dataLm.months)).toBe(true)
    expect(dataYtd.months.length).toBeGreaterThanOrEqual(2)
    expect(dataLm.months.length).toBeGreaterThanOrEqual(1)
    // Derived lines exist and align to months length
    const niYtd = dataYtd.lines.find((l: any) => l.name === 'Net Income')
    const niLm = dataLm.lines.find((l: any) => l.name === 'Net Income')
    expect(niYtd).toBeTruthy()
    expect(niLm).toBeTruthy()
    expect(niYtd.values.length).toBe(dataYtd.months.length)
    expect(niLm.values.length).toBe(dataLm.months.length)
  })
})
