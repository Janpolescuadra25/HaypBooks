import { GET as BPCsv } from '@/app/api/bill-payments/export/route'

const makeReq = (url: string) => new Request(url)

describe('Bill Payments CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await BPCsv(makeReq('http://test/api/bill-payments/export') as any)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await BPCsv(makeReq('http://test/api/bill-payments/export?csvVersion=1') as any)
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
