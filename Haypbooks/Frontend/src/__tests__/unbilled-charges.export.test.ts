import { GET as GET_EXPORT } from '@/app/api/reports/unbilled-charges/export/route'

const makeReq = (url: string) => new Request(url)

describe('Unbilled Charges CSV export', () => {
  test('includes caption, correct header, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/unbilled-charges/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Date,Customer,Product/Service,Description,Qty,Rate,Amount')
    expect(disp).toContain('unbilled-charges-asof-2025-09-04')
  })
})
