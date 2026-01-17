import { GET as EVS_GET } from '@/app/api/reports/expenses-by-vendor-summary/route'
import { GET as EVS_EXP } from '@/app/api/reports/expenses-by-vendor-summary/export/route'

const makeReq = (url: string) => new Request(url)

describe('Expenses by Vendor Summary report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await EVS_GET(makeReq('http://localhost/api/reports/expenses-by-vendor-summary?period=YTD&end=2025-09-04'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/expenses-by-vendor-summary/export?end=2025-09-04'
    const res: any = await EVS_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    const headerIdx = lines.findIndex(l => l.startsWith('Vendor,Transactions,Qty,Amount'))
    expect(headerIdx).toBeGreaterThanOrEqual(0)
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('expenses-by-vendor-summary-asof-2025-09-04')
  })
})
