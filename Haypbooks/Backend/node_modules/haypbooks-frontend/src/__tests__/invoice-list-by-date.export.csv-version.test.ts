import { GET as CSVHandler } from '@/app/api/reports/invoice-list-by-date/export/route'

const makeReq = (url: string) => new Request(url)

describe('Invoice List by Date CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await CSVHandler(makeReq('http://test/api/reports/invoice-list-by-date/export'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })
  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await CSVHandler(makeReq('http://test/api/reports/invoice-list-by-date/export?csvVersion=1'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy()
    // header may appear at different indices depending on caption spacing; ensure a Date header exists soon
    expect(lines.slice(1,5).some(l => l.startsWith('Date,'))).toBeTruthy()
  })
})
