import { GET as GET_JSON } from '@/app/api/reports/profit-loss-by-month/route'

const req = (url: string) => new Request(url)

describe('Profit & Loss by Month JSON API', () => {
  it('returns months and lines with values', async () => {
    const res: any = await GET_JSON(req('http://localhost/api/reports/profit-loss-by-month?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.months)).toBe(true)
    expect(body.months.length).toBeGreaterThan(0)
    expect(Array.isArray(body.lines)).toBe(true)
    for (const l of body.lines) {
      expect(Array.isArray(l.values)).toBe(true)
      expect(l.values.length).toBe(body.months.length)
    }
  })

  it('respects custom start/end range', async () => {
    const res: any = await GET_JSON(req('http://localhost/api/reports/profit-loss-by-month?start=2025-01-01&end=2025-03-31'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.months).toEqual(['2025-01','2025-02','2025-03'])
  })
})
