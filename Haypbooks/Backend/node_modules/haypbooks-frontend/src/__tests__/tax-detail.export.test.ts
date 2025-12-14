/** @jest-environment node */
export {}

function headersToRecord(h: Headers) {
  const rec: Record<string, string> = {}
  h.forEach((v, k) => { rec[k.toLowerCase()] = v })
  return rec
}

describe('Tax Detail CSV export', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-09-14T12:00:00Z'))
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  it('returns CSV with As of caption and deterministic filename', async () => {
    const { GET } = await import('@/app/api/reports/tax-detail/export/route')
    const url = 'http://localhost/api/reports/tax-detail/export?period=Today'
    const res = await GET(new Request(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const firstLine = text.split('\n', 1)[0]
    expect(firstLine).toContain('September 14, 2025')
    const headers = headersToRecord(res.headers)
    const disp = headers['content-disposition']
    expect(disp).toContain('tax-detail-asof-2025-09-14')
    expect(headers['content-type']).toContain('text/csv')
    // release memory
    ;(global as any).__lastTaxDetail = firstLine
  })

  it('omits CSV-Version by default and includes when opted-in', async () => {
    const { GET } = await import('@/app/api/reports/tax-detail/export/route')
    // Default: no CSV-Version row
    const urlNo = 'http://localhost/api/reports/tax-detail/export?period=Today'
    const resNo = await GET(new Request(urlNo))
    expect(resNo.status).toBe(200)
    const bodyNo = await resNo.text()
    const firstNo = bodyNo.split('\n', 1)[0]
    expect(firstNo.startsWith('CSV-Version')).toBe(false)

    // Opt-in: include CSV-Version,1 as the first row
    const urlYes = 'http://localhost/api/reports/tax-detail/export?period=Today&csvVersion=1'
    const resYes = await GET(new Request(urlYes))
    expect(resYes.status).toBe(200)
    const bodyYes = await resYes.text()
    const firstYes = bodyYes.split('\n', 1)[0]
    expect(firstYes).toBe('CSV-Version,1')
  })

  it('returns Forbidden when RBAC denies access', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))
    const { GET } = await import('@/app/api/reports/tax-detail/export/route')
    const url = 'http://localhost/api/reports/tax-detail/export?period=Today'
    const res = await GET(new Request(url))
    expect(res.status).toBe(403)
    const text = await res.text()
    expect(text).toBe('Forbidden')
  })
})
