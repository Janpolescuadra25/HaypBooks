import { GET as GET_EXPORT } from '@/app/api/reports/unbilled-time/export/route'

const makeReq = (url: string) => new Request(url)

describe('Unbilled Time CSV export', () => {
  test('includes caption, correct header, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/unbilled-time/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Date,Employee,Customer,Service,Description,Hours,Rate,Amount')
    expect(disp).toContain('unbilled-time-asof-2025-09-04')
  })
})
