/** @jest-environment node */
export {}

function headersToRecord(h: Headers) {
  const rec: Record<string, string> = {}
  h.forEach((v, k) => { rec[k.toLowerCase()] = v })
  return rec
}

describe('Budget vs Actual CSV export', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-09-14T12:00:00Z'))
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  it('returns CSV with As of caption and deterministic filename', async () => {
    const { GET } = await import('@/app/api/reports/budget-vs-actual/export/route')
    const url = 'http://localhost/api/reports/budget-vs-actual/export?period=Today'
    const res = await GET(new Request(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const firstLine = text.split('\n', 1)[0]
    expect(firstLine).toContain('September 14, 2025')
    const headers = headersToRecord(res.headers)
    const disp = headers['content-disposition']
    expect(disp).toContain('budget-vs-actual-asof-2025-09-14')
    expect(headers['content-type']).toContain('text/csv')
  })

  it('returns Forbidden when RBAC denies access', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))
    const { GET } = await import('@/app/api/reports/budget-vs-actual/export/route')
    const url = 'http://localhost/api/reports/budget-vs-actual/export?period=Today'
    const res = await GET(new Request(url))
    expect(res.status).toBe(403)
    const text = await res.text()
    expect(text).toBe('Forbidden')
  })
})