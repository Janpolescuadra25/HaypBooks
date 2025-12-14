import { GET as OPOL_GET } from '@/app/api/reports/open-po-list-by-vendor/route'
import { GET as OPOL_EXP } from '@/app/api/reports/open-po-list-by-vendor/export/route'

const makeReq = (url: string) => new Request(url)

describe('Open Purchase Order List by Vendor report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await OPOL_GET(makeReq('http://localhost/api/reports/open-po-list-by-vendor?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.qtyOpen).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/open-po-list-by-vendor/export?end=2025-09-04'
    const res: any = await OPOL_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Vendor,Number,Date,Item,Qty Ordered,Qty Received,Qty Open,Rate,Amount Open')
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('open-po-list-by-vendor-asof-2025-09-04')
  })
})
