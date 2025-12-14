import { GET as SRCsv } from '@/app/api/sales-receipts/export/route'

const makeReq = (url: string) => new Request(url)

describe('Sales Receipts CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await SRCsv(makeReq('http://test/api/sales-receipts/export'))
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await SRCsv(makeReq('http://test/api/sales-receipts/export?csvVersion=1'))
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
