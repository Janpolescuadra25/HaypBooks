import { GET as AL_GET } from '@/app/api/reports/account-list/route'
import { GET as AL_EXP } from '@/app/api/reports/account-list/export/route'

const makeReq = (url: string) => new Request(url)

describe('Account List report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await AL_GET(makeReq('http://localhost/api/reports/account-list?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.opening).toBe('number')
    expect(typeof body.totals.balance).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/account-list/export?end=2025-09-04'
    const res: any = await AL_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    // caption + blank + header + >= 1 data + total
    expect(lines[2]).toBe('Account,Type,Opening,Net Change,Balance')
    expect(lines[lines.length - 1].startsWith('Total,')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('account-list-asof-2025-09-04')
  })
})
