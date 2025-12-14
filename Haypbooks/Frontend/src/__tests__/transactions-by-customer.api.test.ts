import { GET as TBC_GET } from '@/app/api/reports/transactions-by-customer/route'
import { GET as TBC_EXP } from '@/app/api/reports/transactions-by-customer/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction List by Customer report', () => {
  test('JSON API returns rows, grouped totals, and asOf or range', async () => {
    const res: any = await TBC_GET(makeReq('http://localhost/api/reports/transactions-by-customer?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(body).toHaveProperty('byCustomer')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption, subtotals per customer and grand total; filename with asof', async () => {
    const url = 'http://localhost/api/reports/transactions-by-customer/export?end=2025-09-04'
    const res: any = await TBC_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    // Caption line then blank line then header; accept either range-style caption (quoted) or As of style
    expect(lines[0].length).toBeGreaterThan(0)
    expect(lines[0]).toMatch(/".*202\d.*"|As of/)
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Date,Type,Number,Customer,Memo,Amount')
    expect(lines.find((l: string) => l.startsWith('Subtotal,,,'))).toBeTruthy()
    expect(lines[lines.length - 1].startsWith('Total')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('transactions-by-customer-asof-2025-09-04')
  })
})
