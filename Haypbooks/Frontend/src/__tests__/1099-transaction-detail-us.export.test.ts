import { GET as GET_EXPORT } from '@/app/api/reports/1099-transaction-detail-us/export/route'

function makeReq(url: string): Request {
  return new Request(url)
}

describe('1099 Transaction Detail CSV export', () => {
  test('uses date range caption when start and end provided, correct header, and filename', async () => {
    const url = 'http://localhost/api/reports/1099-transaction-detail-us/export?period=YTD&start=2025-01-01&end=2025-09-30'
    const res: any = await GET_EXPORT(makeReq(url))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)

    // Caption row shows explicit range when both start and end are present
    expect(lines[0]).toBe('2025-01-01 - 2025-09-30')

    // Header row is index 2
    expect(lines[2]).toBe('Date,Vendor,TIN (masked),Amount,Account,Memo,Eligible (>= $600 YTD)')

    // Filename includes period and as-of date even when range caption is used
    expect(disp).toContain('1099-transaction-detail-us-YTD-asof-2025-09-30')
  })
})
