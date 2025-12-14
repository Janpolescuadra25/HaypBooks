import { GET as PBPD_GET } from '@/app/api/reports/purchases-by-product-detail/route'
import { GET as PBPD_EXP } from '@/app/api/reports/purchases-by-product-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Purchases by Product/Service Detail report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await PBPD_GET(makeReq('http://localhost/api/reports/purchases-by-product-detail?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('tag filter (when enabled) affects JSON and CSV output', async () => {
    process.env.NEXT_PUBLIC_ENABLE_TAGS = 'true'
    const baseRes: any = await PBPD_GET(makeReq('http://localhost/api/reports/purchases-by-product-detail?period=YTD'))
    const base = await baseRes.json()
    const taggedRes: any = await PBPD_GET(makeReq('http://localhost/api/reports/purchases-by-product-detail?period=YTD&tag=alpha'))
    const tagged = await taggedRes.json()
    expect(tagged.rows.length).toBeLessThanOrEqual(base.rows.length)
    expect(tagged.rows.length).toBeGreaterThan(0)

    const csvRes: any = await PBPD_EXP(makeReq('http://localhost/api/reports/purchases-by-product-detail/export?period=YTD&tag=alpha'))
    const text = await csvRes.text()
    const lines = text.trim().split(/\r?\n/)
    const dataLines = lines.slice(3, lines.length - 1)
    expect(dataLines.length).toBeGreaterThan(0)
  })
})
