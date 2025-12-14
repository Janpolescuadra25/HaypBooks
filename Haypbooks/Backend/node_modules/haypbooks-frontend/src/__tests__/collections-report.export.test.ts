import { GET as GET_EXPORT } from '@/app/api/reports/collections-report/export/route'

const makeReq = (url: string) => new Request(url)

describe('Collections Report CSV export', () => {
  test('includes caption, correct header, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/collections-report/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Customer,Invoice Number,Due Date,Days Overdue,Open Balance,Contact,Phone')
    expect(disp).toContain('collections-report-asof-2025-09-04')
  })
})
