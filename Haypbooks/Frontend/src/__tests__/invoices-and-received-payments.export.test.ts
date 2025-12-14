import { GET as GET_EXPORT } from '@/app/api/reports/invoices-and-received-payments/export/route'

const makeReq = (url: string) => new Request(url)

describe('Invoices and Received Payments CSV export', () => {
  test('includes caption, correct header, totals, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/invoices-and-received-payments/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Customer,Invoice Number,Invoice Date,Due Date,Payment Date,Payment Amount,Open Balance')
    expect(lines[lines.length - 1].startsWith('Totals')).toBe(true)
    expect(disp).toContain('invoices-and-received-payments-asof-2025-09-04')
  })
})
