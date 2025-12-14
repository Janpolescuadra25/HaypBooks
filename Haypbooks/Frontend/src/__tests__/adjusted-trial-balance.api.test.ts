import { GET as ATB_GET } from '@/app/api/reports/adjusted-trial-balance/route'
import { GET as ATB_EXP } from '@/app/api/reports/adjusted-trial-balance/export/route'

const makeReq = (url: string) => new Request(url)

describe('Adjusted Trial Balance report', () => {
  test('JSON API returns rows, totals, balanced flag, and asOf', async () => {
    const res: any = await ATB_GET(makeReq('http://localhost/api/reports/adjusted-trial-balance?period=YTD&end=2025-01-31'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.finalDebit).toBe('number')
    expect(typeof body.totals.finalCredit).toBe('number')
    expect(body.balanced).toBe(true)
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption, header, totals row, and correct filename token', async () => {
    const url = 'http://localhost/api/reports/adjusted-trial-balance/export?end=2025-09-04'
    const res: any = await ATB_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[1]).toBeDefined()
    expect(lines[2]).toBe('Account,Name,Unadj Debit,Unadj Credit,Adj Debit,Adj Credit,Final Debit,Final Credit')
    expect(lines[lines.length - 1].includes('Totals')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('adjusted-trial-balance-asof-2025-09-04')
  })
})
