import { GET as DD_GET } from '@/app/api/reports/deposit-detail/route'

const makeReq = (url: string) => new Request(url)

describe('Deposit Detail JSON API', () => {
  test('returns rows', async () => {
    const res: any = await DD_GET(makeReq('http://localhost/api/reports/deposit-detail'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
  })

  test('start/end filters constrain dates', async () => {
    const url = 'http://localhost/api/reports/deposit-detail?start=2025-01-10&end=2025-01-12'
    const res: any = await DD_GET(makeReq(url))
    expect(res.status).toBe(200)
    const { rows } = await res.json()
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      expect(r.date >= '2025-01-10').toBe(true)
      expect(r.date <= '2025-01-12').toBe(true)
    }
  })

  test('q filter matches customer or description', async () => {
    const url = 'http://localhost/api/reports/deposit-detail?q=customer%2012&start=2025-01-12&end=2025-01-15'
    const res: any = await DD_GET(makeReq(url))
    expect(res.status).toBe(200)
    const { rows } = await res.json()
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      const s = (r.customer + ' ' + (r.description || '')).toLowerCase()
      expect(s.includes('customer 12')).toBe(true)
      expect(r.date >= '2025-01-12' && r.date <= '2025-01-15').toBe(true)
    }
  })

  test('empty result when start > end', async () => {
    const url = 'http://localhost/api/reports/deposit-detail?start=2025-01-15&end=2025-01-10'
    const res: any = await DD_GET(makeReq(url))
    expect(res.status).toBe(200)
    const { rows } = await res.json()
    // route applies filters independently; this case yields none
    expect(rows.length).toBe(0)
  })
})
