import { GET as IJT_GET } from '@/app/api/reports/invalid-journal-transactions/route'
import { GET as IJT_EXP } from '@/app/api/reports/invalid-journal-transactions/export/route'

const makeReq = (url: string) => new Request(url)

describe('Invalid Journal Transactions report', () => {
  test('JSON API returns rows and asOf', async () => {
    const res: any = await IJT_GET(makeReq('http://localhost/api/reports/invalid-journal-transactions?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption, headers, totals, and filename token', async () => {
    const url = 'http://localhost/api/reports/invalid-journal-transactions/export?end=2025-09-04'
    const res: any = await IJT_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Journal ID,Number,Date,Issue,Line,Account,Debit,Credit')
    // Last row is totals
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('invalid-journal-transactions-asof-2025-09-04')
  })
})
