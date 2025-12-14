import { GET as GET_EXPORT } from '@/app/api/reports/vendor-balance-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Vendor Balance Detail CSV export', () => {
  test('includes caption, correct header, filename, and totals', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/vendor-balance-detail/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    // Caption and header
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Date,Type,Number,Vendor,Memo,Amount')
    // Filename convention
    expect(disp).toContain('vendor-balance-detail-asof-2025-09-04')
    // Totals row present and parsable
    const last = lines[lines.length - 1]
    expect(last.startsWith('Totals')).toBe(true)
  })
})
