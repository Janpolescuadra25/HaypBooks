import { GET as OPOD_GET } from '@/app/api/reports/open-po-detail/route'
import { GET as OPOD_EXP } from '@/app/api/reports/open-po-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Open Purchase Order Detail report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await OPOD_GET(makeReq('http://localhost/api/reports/open-po-detail?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.qtyOpen).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/open-po-detail/export?end=2025-09-04'
    const res: any = await OPOD_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Date,Type,Number,Vendor,Item,Qty Ordered,Qty Received,Qty Open,Rate,Amount Open')
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('open-po-detail-asof-2025-09-04')
  })
})
