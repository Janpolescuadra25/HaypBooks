import { GET as EVS_GET } from '@/app/api/reports/expenses-by-vendor-summary/route'
import { GET as EVS_EXP } from '@/app/api/reports/expenses-by-vendor-summary/export/route'

const makeReq = (url: string) => new Request(url)

describe('Expenses by Vendor Summary tag filter', () => {
  test('JSON and CSV honor tag when feature flag enabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_TAGS = 'true'

    const baseRes: any = await EVS_GET(makeReq('http://localhost/api/reports/expenses-by-vendor-summary?period=YTD&end=2025-09-04'))
    const base = await baseRes.json()

    const taggedRes: any = await EVS_GET(makeReq('http://localhost/api/reports/expenses-by-vendor-summary?period=YTD&tag=alpha&end=2025-09-04'))
    const tagged = await taggedRes.json()

    expect(tagged.rows.length).toBeLessThanOrEqual(base.rows.length)
    expect(tagged.rows.length).toBeGreaterThan(0)

    const csvRes: any = await EVS_EXP(makeReq('http://localhost/api/reports/expenses-by-vendor-summary/export?period=YTD&tag=alpha&end=2025-09-04'))
    const text = await csvRes.text()
    const lines = text.trim().split(/\r?\n/)
    const headerIdx = lines.findIndex(l => l.startsWith('Vendor,Transactions,Qty,Amount'))
    expect(headerIdx).toBeGreaterThanOrEqual(0)
    const dataLines = lines.slice(headerIdx + 1, lines.length - 1)
    expect(dataLines.length).toBeGreaterThan(0)
  })
})
