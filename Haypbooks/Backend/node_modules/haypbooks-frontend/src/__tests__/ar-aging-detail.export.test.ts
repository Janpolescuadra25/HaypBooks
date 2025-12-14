import { GET as GET_EXPORT } from '@/app/api/reports/ar-aging-detail/export/route'

function makeReq(url: string): Request {
  return new Request(url)
}

describe('A/R Aging Detail CSV export', () => {
  test('includes date caption or range, correct header, and filename', async () => {
    const url = 'http://localhost/api/reports/ar-aging-detail/export?end=2025-09-04'
    const res: any = await GET_EXPORT(makeReq(url))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)

    // Caption row shows provided end date when only end is provided
    expect(lines[0]).toBe('2025-09-04')

    // Header row is index 2 (caption, blank, header)
    expect(lines[2]).toBe('Customer,Type,Number,Invoice Date,Due Date,Aging (days),Open Balance')

    // Filename format suffix with as-of date
    expect(disp).toContain('ar-aging-detail-asof-2025-09-04')
  })
})
