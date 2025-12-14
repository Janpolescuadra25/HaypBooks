import { GET as TDBA_GET } from '@/app/api/reports/transaction-detail-by-account/route'
import { GET as TDBA_EXP } from '@/app/api/reports/transaction-detail-by-account/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction Detail by Account report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await TDBA_GET(makeReq('http://localhost/api/reports/transaction-detail-by-account?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.debit).toBe('number')
    expect(typeof body.totals.credit).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/transaction-detail-by-account/export?end=2025-09-04'
    const res: any = await TDBA_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Account,Date,Memo,Debit,Credit')
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('transaction-detail-by-account-asof-2025-09-04')
  })
})
