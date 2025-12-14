import { GET as EXPORT_GET } from '@/app/api/reports/transactions-by-vendor/export/route'
import { setRoleOverride } from '@/lib/rbac-server'

const makeReq = (url: string) => new Request(url)

describe('Transactions by Vendor CSV export', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('includes caption, header, subtotals and total, and uses helper filename', async () => {
    setRoleOverride('admin' as any)
    const res: any = await EXPORT_GET(makeReq('http://localhost/api/reports/transactions-by-vendor/export?period=ThisMonth'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.split(/\r?\n/)
  // Caption line then blank line then header
  // Accept either range-style caption (e.g., "October 1-31, 2025") or an As of style, and allow quotes due to CSV escaping
  expect(lines[0].length).toBeGreaterThan(0)
  expect(lines[0]).toMatch(/".*202\d.*"|As of:/)
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Date,Type,Number,Vendor,Memo,Amount')
    // Contains at least one Subtotal and trailing Total
  expect(lines.some((l: string) => l.startsWith('Subtotal,'))).toBe(true)
  expect(lines.some((l: string) => l.startsWith('Total,'))).toBe(true)
    // Filename header should be present and shaped by helper
    const cd = res.headers.get('Content-Disposition') || ''
    expect(cd).toMatch(/filename="transactions-by-vendor-.*\.csv"/)
  })
})
