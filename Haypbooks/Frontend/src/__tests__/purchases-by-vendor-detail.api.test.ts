import { GET as PBVD_GET } from '@/app/api/reports/purchases-by-vendor-detail/route'
import { GET as PBVD_EXP } from '@/app/api/reports/purchases-by-vendor-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Purchases by Vendor Detail report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await PBVD_GET(makeReq('http://localhost/api/reports/purchases-by-vendor-detail?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/purchases-by-vendor-detail/export?end=2025-09-04'
    const res: any = await PBVD_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Date,Type,Number,Item,Vendor,Qty,Rate,Amount')
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('purchases-by-vendor-detail-asof-2025-09-04')
  })
})
