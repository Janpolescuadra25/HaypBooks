import { GET as CSVHandler } from '@/app/api/reports/invoices-and-received-payments/export/route'

const makeReq = (url: string) => new Request(url)

describe('Invoices and Received Payments CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await CSVHandler(makeReq('http://test/api/reports/invoices-and-received-payments/export?end=2025-09-04'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })
  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await CSVHandler(makeReq('http://test/api/reports/invoices-and-received-payments/export?end=2025-09-04&csvVersion=1'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy()
    expect(lines[2]).toBe('')
    expect(lines[3].startsWith('Customer,')).toBe(true)
  })
})
