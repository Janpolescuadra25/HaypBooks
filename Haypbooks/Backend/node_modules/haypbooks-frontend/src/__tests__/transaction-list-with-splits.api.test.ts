import { GET as TLS_GET } from '@/app/api/reports/transaction-list-with-splits/route'
import { GET as TLS_EXP } from '@/app/api/reports/transaction-list-with-splits/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction List with Splits report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await TLS_GET(makeReq('http://localhost/api/reports/transaction-list-with-splits?period=YTD'))
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
    const url = 'http://localhost/api/reports/transaction-list-with-splits/export?end=2025-09-04'
    const res: any = await TLS_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Txn ID,Date,Type,Number,Payee,Memo,Split Account,Debit,Credit')
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('transaction-list-with-splits-asof-2025-09-04')
  })
})
