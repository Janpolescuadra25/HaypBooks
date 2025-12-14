import { GET } from '@/app/api/reports/unbilled-time/route'
import { NextRequest } from 'next/server'

function makeReq(url: string) {
  return new NextRequest(url)
}

describe('unbilled-time JSON API', () => {
  it('returns totals (hours and amount) and asOf with only end provided (includes all rows)', async () => {
    const req = makeReq('http://test/api/reports/unbilled-time?end=2025-09-04')
    const res: any = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    // Expect three rows based on generator offsets
    expect(Array.isArray(data.rows)).toBe(true)
    expect(data.rows.length).toBe(3)
    // Totals: hours 3.5 + 5 + 2 = 10.5; amount 420 + 475 + 240 = 1135
    expect(data.totals.hours).toBeCloseTo(10.5, 5)
    expect(data.totals.amount).toBeCloseTo(1135, 5)
    // asOf should equal provided end; start null; period null
    expect(data.asOf).toBe('2025-09-04')
    expect(data.start).toBeNull()
    expect(data.end).toBe('2025-09-04')
    expect(data.period).toBeNull()
  })

  it('respects explicit start and end filters', async () => {
    const req = makeReq('http://test/api/reports/unbilled-time?start=2025-09-01&end=2025-09-04')
    const res: any = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    // Only rows on or after 2025-09-01 and on/before 2025-09-04 remain.
    // From generator: dates at offsets 3, 7, 1 relative to end=2025-09-04 → rows on 9/01, 8/28, 9/03. Filter removes 8/28.
    expect(data.rows.length).toBe(2)
    // Totals: hours 3.5 + 2 = 5.5; amount 420 + 240 = 660
    expect(data.totals.hours).toBeCloseTo(5.5, 5)
    expect(data.totals.amount).toBeCloseTo(660, 5)
    expect(data.asOf).toBe('2025-09-04')
    expect(data.start).toBe('2025-09-01')
    expect(data.end).toBe('2025-09-04')
  })
})
