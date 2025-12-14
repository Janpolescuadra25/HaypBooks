import { GET as GET_EXPORT } from '@/app/api/reports/1099-contractor-balance-summary-us/export/route'

function makeReq(url: string): Request {
  return new Request(url)
}

describe('1099 Contractor Balance Summary CSV export', () => {
  test('includes period-asof caption, correct header, and filename', async () => {
    const url = 'http://localhost/api/reports/1099-contractor-balance-summary-us/export?period=YTD&end=2025-09-04'
    const res: any = await GET_EXPORT(makeReq(url))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)

    // Caption row (index 0) uses period-asof style
    expect(lines[0]).toBe('YTD-asof-2025-09-04')

    // Header row is index 2 (caption, blank, header)
    expect(lines[2]).toBe('Vendor,TIN (masked),YTD Nonemployee Comp,Eligible (>= $600)')

    // Filename includes period and as-of date
    expect(disp).toContain('1099-contractor-balance-summary-us-YTD-asof-2025-09-04')
  })
})
