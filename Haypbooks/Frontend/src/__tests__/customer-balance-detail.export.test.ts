import { GET as GET_EXPORT } from '@/app/api/reports/customer-balance-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Customer Balance Detail CSV export', () => {
  test('includes caption, correct header, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/customer-balance-detail/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Date,Type,Number,Customer,Memo,Amount')
    expect(disp).toContain('customer-balance-detail-asof-2025-09-04')
  })
})
