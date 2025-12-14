import { GET as GET_JSON } from '@/app/api/reports/profit-loss-by-quarter/route'

const req = (url: string) => new Request(url)

describe('Profit & Loss by Quarter JSON API', () => {
  it('returns quarters and lines with values', async () => {
    const res: any = await GET_JSON(req('http://localhost/api/reports/profit-loss-by-quarter?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.quarters)).toBe(true)
    expect(body.quarters.length).toBeGreaterThan(0)
    expect(Array.isArray(body.lines)).toBe(true)
    for (const l of body.lines) {
      expect(Array.isArray(l.values)).toBe(true)
      expect(l.values.length).toBe(body.quarters.length)
    }
  })

  it('respects custom start/end range', async () => {
    const res: any = await GET_JSON(req('http://localhost/api/reports/profit-loss-by-quarter?start=2025-01-01&end=2025-06-30'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.quarters).toEqual(['2025-Q1','2025-Q2'])
  })
})
