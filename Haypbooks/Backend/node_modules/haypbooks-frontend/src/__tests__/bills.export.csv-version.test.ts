import { GET as BillsCSV } from '@/app/api/bills/export/route'

const makeReq = (url: string) => new Request(url)

describe('Bills CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await BillsCSV(makeReq('http://test/api/bills/export'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await BillsCSV(makeReq('http://test/api/bills/export?csvVersion=1'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy()
  })
})
