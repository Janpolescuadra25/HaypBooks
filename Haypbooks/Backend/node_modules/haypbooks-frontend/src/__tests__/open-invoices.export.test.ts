import { GET as GET_EXPORT } from '@/app/api/reports/open-invoices/export/route'

const makeReq = (url: string) => new Request(url)

describe('Open Invoices CSV export', () => {
  test('includes caption, correct header, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/open-invoices/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Customer,Type,Number,Invoice Date,Due Date,Aging (days),Open Balance')
    expect(disp).toContain('open-invoices-asof-2025-09-04')
  })
})
