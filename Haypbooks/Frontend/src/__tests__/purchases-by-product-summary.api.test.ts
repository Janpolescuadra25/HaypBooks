import { GET as PBPS_GET } from '@/app/api/reports/purchases-by-product-summary/route'
import { GET as PBPS_EXP } from '@/app/api/reports/purchases-by-product-summary/export/route'

const makeReq = (url: string) => new Request(url)

describe('Purchases by Product/Service Summary report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await PBPS_GET(makeReq('http://localhost/api/reports/purchases-by-product-summary?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/purchases-by-product-summary/export?end=2025-09-04'
    const res: any = await PBPS_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Item,Transactions,Qty,Amount')
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('purchases-by-product-summary-asof-2025-09-04')
  })

  test('tag filter (when enabled) affects JSON and CSV output', async () => {
    process.env.NEXT_PUBLIC_ENABLE_TAGS = 'true'
    const baseRes: any = await PBPS_GET(makeReq('http://localhost/api/reports/purchases-by-product-summary?period=YTD'))
    const base = await baseRes.json()
    const taggedRes: any = await PBPS_GET(makeReq('http://localhost/api/reports/purchases-by-product-summary?period=YTD&tag=alpha'))
    const tagged = await taggedRes.json()
    expect(tagged.rows.length).toBeLessThanOrEqual(base.rows.length)
    expect(tagged.rows.length).toBeGreaterThan(0)

    const csvRes: any = await PBPS_EXP(makeReq('http://localhost/api/reports/purchases-by-product-summary/export?period=YTD&tag=alpha'))
    const text = await csvRes.text()
    const lines = text.trim().split(/\r?\n/)
    const dataLines = lines.slice(3, lines.length - 1)
    expect(dataLines.length).toBeGreaterThan(0)
  })
})
