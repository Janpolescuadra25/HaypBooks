import { GET as GET_JSON } from '@/app/api/reports/budget-vs-actual/route'

function makeReq(path: string, qs?: Record<string, string>) {
  const url = new URL(`http://localhost${path}`)
  if (qs) Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v))
  return new Request(url.toString())
}

describe('Budget vs Actual JSON API (compare)', () => {
  it('returns prev metrics and prevTotals when compare=1', async () => {
    const req = makeReq('/api/reports/budget-vs-actual', { period: 'Today', compare: '1' })
    const res: any = await GET_JSON(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    // Each row should include prev fields
    for (const r of body.rows) {
      expect(r).toHaveProperty('prev')
      expect(typeof r.prev.budgeted).toBe('number')
      expect(typeof r.prev.actual).toBe('number')
      expect(typeof r.prev.variance).toBe('number')
      expect(typeof r.prev.variancePct).toBe('number')
    }
    // Totals and prevTotals should be present
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.budgeted).toBe('number')
    expect(body).toHaveProperty('prevTotals')
    expect(body.prevTotals).not.toBeNull()
    expect(typeof body.prevTotals.budgeted).toBe('number')
    expect(typeof body.prevTotals.actual).toBe('number')
  })
})
