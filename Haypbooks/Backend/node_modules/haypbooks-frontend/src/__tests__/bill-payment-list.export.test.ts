import { GET as GET_EXPORT } from '@/app/api/reports/bill-payment-list/export/route'

function makeReq(url: string): Request {
  return new Request(url)
}

describe('Bill Payment List CSV export', () => {
  test('includes date caption, correct header, and filename', async () => {
    const url = 'http://localhost/api/reports/bill-payment-list/export?end=2025-09-04'
    const res: any = await GET_EXPORT(makeReq(url))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)

    // Caption row (index 0) is the explicit end date when end is provided
    expect(lines[0]).toBe('2025-09-04')

    // Header row is index 2 (caption, blank, header)
    expect(lines[2]).toBe('Date,Type,Number,Vendor,Memo,Amount')

    // Filename format suffix with as-of date
    expect(disp).toContain('bill-payment-list-asof-2025-09-04')
  })
})
