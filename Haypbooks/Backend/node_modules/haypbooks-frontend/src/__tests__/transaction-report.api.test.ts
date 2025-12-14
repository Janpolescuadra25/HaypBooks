import { GET as TR_GET } from '@/app/api/reports/transaction-report/route'
import { GET as TR_EXP } from '@/app/api/reports/transaction-report/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction Report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await TR_GET(makeReq('http://localhost/api/reports/transaction-report?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.net).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/transaction-report/export?end=2025-09-04'
    const res: any = await TR_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('ID,Date,Type,Number,Name,Memo,Amount')
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('transaction-report-asof-2025-09-04')
  })
})
