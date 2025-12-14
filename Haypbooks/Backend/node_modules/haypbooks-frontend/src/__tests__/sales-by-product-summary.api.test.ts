import { GET as SPS_GET } from '@/app/api/reports/sales-by-product-summary/route'
import { GET as SPS_EXP } from '@/app/api/reports/sales-by-product-summary/export/route'

const makeReq = (url: string) => new Request(url)

describe('Sales by Product/Service Summary report', () => {
  test('JSON API returns rows, totals, and asOf or range', async () => {
    const res: any = await SPS_GET(makeReq('http://localhost/api/reports/sales-by-product-summary?period=YTD'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.rows)).toBe(true)
    expect(body.rows.length).toBeGreaterThan(0)
    expect(body).toHaveProperty('totals')
    expect(typeof body.totals.amount).toBe('number')
    expect(typeof body.asOf).toBe('string')
  })

  test('CSV export includes caption and totals and filename with asof', async () => {
    const url = 'http://localhost/api/reports/sales-by-product-summary/export?end=2025-09-04'
    const res: any = await SPS_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    expect(lines[2]).toBe('Product/Service,Transactions,Qty,Amount')
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('sales-by-product-summary-asof-2025-09-04')
  })

  test('product filter narrows rows in JSON and CSV', async () => {
    // JSON
    const resJson: any = await SPS_GET(makeReq('http://localhost/api/reports/sales-by-product-summary?period=YTD&product=Consulting'))
    expect(resJson.status).toBe(200)
    const body = await resJson.json()
    expect(body.rows.every((r: any) => r.product === 'Consulting')).toBe(true)

    // CSV
    const url = 'http://localhost/api/reports/sales-by-product-summary/export?period=YTD&product=Consulting'
    const resCsv: any = await SPS_EXP(makeReq(url))
    const text = await resCsv.text()
    const lines = text.trim().split(/\r?\n/)
    // Header line index 2, data lines start after it until totals
    const dataLines = lines.slice(3, lines.length - 1)
    expect(dataLines.length).toBeGreaterThan(0)
    for (const line of dataLines) {
      const cols = line.split(',')
      expect(cols[0]).toBe('Consulting')
    }
  })

  test('tag filter (when enabled) affects JSON and CSV output', async () => {
    // Enable flag in process env for test runtime
    process.env.NEXT_PUBLIC_ENABLE_TAGS = 'true'

    // Get baseline without tag
    const baseRes: any = await SPS_GET(makeReq('http://localhost/api/reports/sales-by-product-summary?period=YTD'))
    const base = await baseRes.json()

    // With a specific tag
    const taggedRes: any = await SPS_GET(makeReq('http://localhost/api/reports/sales-by-product-summary?period=YTD&tag=alpha'))
    const tagged = await taggedRes.json()

    expect(tagged.rows.length).toBeLessThanOrEqual(base.rows.length)
    expect(tagged.rows.length).toBeGreaterThan(0)

    // CSV parity
    const csvRes: any = await SPS_EXP(makeReq('http://localhost/api/reports/sales-by-product-summary/export?period=YTD&tag=alpha'))
    const text = await csvRes.text()
    const lines = text.trim().split(/\r?\n/)
    const dataLines = lines.slice(3, lines.length - 1)
    expect(dataLines.length).toBeGreaterThan(0)
  })
})
