import { GET as ILBD_GET } from '@/app/api/reports/invoice-list-by-date/route'
import { GET as ILBD_EXP } from '@/app/api/reports/invoice-list-by-date/export/route'

const makeReq = (url: string) => new Request(url)

describe('Invoice List by Date report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await ILBD_GET(makeReq('http://localhost/api/reports/invoice-list-by-date?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(typeof body.totals.openBalance).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/invoice-list-by-date/export?end=2025-09-04'
    const res: any = await ILBD_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    // header line may appear at different indices depending on caption formatting; check presence within the first few lines
    expect(lines.slice(0,6).some(l => l.startsWith('Date,Invoice #,Customer'))).toBeTruthy()
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('invoice-list-by-date-asof-2025-09-04')
  })
})
