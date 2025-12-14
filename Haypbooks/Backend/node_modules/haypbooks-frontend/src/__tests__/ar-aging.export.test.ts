import { GET as GET_EXPORT } from '@/app/api/reports/ar-aging/export/route'

const makeReq = (url: string) => new Request(url)

describe('A/R Aging CSV export', () => {
  test('includes caption, correct header, totals, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/ar-aging/export?end=2025-01-31'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    // Caption line should be present
    expect(lines[0]).toBe('As of,"January 31, 2025"')
    expect(lines[2]).toBe('Customer,Current,1-30,31-60,61-90,>90,Total')
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    expect(disp).toContain('ar-aging-asof-2025-01-31')
  })
})
