import { GET as TBV_GET } from '@/app/api/reports/transactions-by-vendor/route'
import { GET as TBV_EXP } from '@/app/api/reports/transactions-by-vendor/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction List by Vendor report', () => {
  test('JSON API returns rows, grouped totals, and asOf or range', async () => {
    const res: any = await TBV_GET(makeReq('http://localhost/api/reports/transactions-by-vendor?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(body).toHaveProperty('byVendor')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption, subtotals per vendor and grand total; filename with asof', async () => {
    const url = 'http://localhost/api/reports/transactions-by-vendor/export?end=2025-09-04'
    const res: any = await TBV_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Date,Type,Number,Vendor,Memo,Amount')
    expect(lines.find((l: string) => l.startsWith('Subtotal,,,'))).toBeTruthy()
    expect(lines[lines.length - 1].startsWith('Total')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('transactions-by-vendor-asof-2025-09-04')
  })
})
