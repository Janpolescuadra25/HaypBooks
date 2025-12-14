import { GET } from '@/app/api/reports/unbilled-charges/route'
import { NextRequest } from 'next/server'

function makeReq(url: string) {
  return new NextRequest(url)
}

describe('unbilled-charges JSON API', () => {
  it('returns totals and asOf when only end is provided (includes all rows)', async () => {
    // Using a fixed end date makes data deterministic
    const req = makeReq('http://test/api/reports/unbilled-charges?end=2025-09-04')
    const res: any = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    // Expect three rows based on generator offsets
    expect(Array.isArray(data.rows)).toBe(true)
    expect(data.rows.length).toBe(3)
    // Totals: 600 + 350.25 + 400 = 1350.25
    expect(data.totals.amount).toBeCloseTo(1350.25, 5)
    // asOf should equal provided end; start null; period null
    expect(data.asOf).toBe('2025-09-04')
    expect(data.start).toBeNull()
    expect(data.end).toBe('2025-09-04')
    expect(data.period).toBeNull()
  })

  it('respects explicit start and end filters', async () => {
    // Start on 2025-09-01 should exclude rows dated in August
    const req = makeReq('http://test/api/reports/unbilled-charges?start=2025-09-01&end=2025-09-04')
    const res: any = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    // Only the 2025-09-02 row remains
    expect(data.rows.length).toBe(1)
    // Totals: amount 400 for the single remaining row
    expect(data.totals.amount).toBeCloseTo(400, 5)
    expect(data.asOf).toBe('2025-09-04')
    expect(data.start).toBe('2025-09-01')
    expect(data.end).toBe('2025-09-04')
  })
})
