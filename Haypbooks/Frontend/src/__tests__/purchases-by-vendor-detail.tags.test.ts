import { GET as PBVD_GET } from '@/app/api/reports/purchases-by-vendor-detail/route'
import { GET as PBVD_EXP } from '@/app/api/reports/purchases-by-vendor-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Purchases by Vendor Detail tag filter', () => {
  test('JSON and CSV honor tag when feature flag enabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_TAGS = 'true'

    const baseRes: any = await PBVD_GET(makeReq('http://localhost/api/reports/purchases-by-vendor-detail?period=YTD&end=2025-09-04'))
    const base = await baseRes.json()

    const taggedRes: any = await PBVD_GET(makeReq('http://localhost/api/reports/purchases-by-vendor-detail?period=YTD&tag=alpha&end=2025-09-04'))
    const tagged = await taggedRes.json()

    expect(tagged.rows.length).toBeLessThanOrEqual(base.rows.length)
    expect(tagged.rows.length).toBeGreaterThan(0)

    const csvRes: any = await PBVD_EXP(makeReq('http://localhost/api/reports/purchases-by-vendor-detail/export?period=YTD&tag=alpha&end=2025-09-04'))
    const text = await csvRes.text()
    const lines = text.trim().split(/\r?\n/)
    const headerIdx = lines.findIndex(l => l.startsWith('Date,Type,Number,Item,Vendor,Qty,Rate,Amount'))
    expect(headerIdx).toBeGreaterThanOrEqual(0)
    const dataLines = lines.slice(headerIdx + 1, lines.length - 1)
    expect(dataLines.length).toBeGreaterThan(0)
  })
})
