/** @jest-environment node */

import { GET as GET_EXPORT } from '@/app/api/reports/tax-liability/export/route'
// Note: use server RBAC mocks for server route gating

function headersToRecord(h: Headers) {
  const rec: Record<string, string> = {}
  h.forEach((v, k) => { rec[k.toLowerCase()] = v })
  return rec
}

describe('Tax Liability CSV export', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-09-14T12:00:00Z'))
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  it('returns CSV with As of caption and deterministic filename', async () => {
    const url = 'http://localhost/api/reports/tax-liability/export?period=Today'
    const res = await GET_EXPORT(new Request(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const firstLine = text.split('\n', 1)[0]
    expect(firstLine).toContain('September 14, 2025')
    const headers = headersToRecord(res.headers)
    const disp = headers['content-disposition']
    expect(disp).toContain('tax-liability-asof-2025-09-14')
    expect(headers['content-type']).toContain('text/csv')
  })

  it('omits CSV-Version by default and includes when opted-in', async () => {
    const { GET } = await import('@/app/api/reports/tax-liability/export/route')
    const noUrl = 'http://localhost/api/reports/tax-liability/export?period=Today'
    const noRes = await GET(new Request(noUrl))
    expect(noRes.status).toBe(200)
    const noText = await noRes.text()
    expect(noText.split('\n', 1)[0].startsWith('CSV-Version')).toBe(false)

    const yesUrl = 'http://localhost/api/reports/tax-liability/export?period=Today&csvVersion=1'
    const yesRes = await GET(new Request(yesUrl))
    expect(yesRes.status).toBe(200)
    const yesText = await yesRes.text()
    expect(yesText.split('\n', 1)[0]).toBe('CSV-Version,1')
  })

  it('returns Forbidden when RBAC denies access', async () => {
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: () => false,
    }))
    const { GET } = await import('@/app/api/reports/tax-liability/export/route')
    const url = 'http://localhost/api/reports/tax-liability/export?period=Today'
    const res = await GET(new Request(url))
    expect(res.status).toBe(403)
    const text = await res.text()
    expect(text).toBe('Forbidden')
  })
})
