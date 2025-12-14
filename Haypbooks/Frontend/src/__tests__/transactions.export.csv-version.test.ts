import { GET as TxCSV } from '@/app/api/transactions/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transactions CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await TxCSV(makeReq('http://test/api/transactions/export'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await TxCSV(makeReq('http://test/api/transactions/export?csvVersion=1'))
    expect(res.status).toBe(200)
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy()
  })
})
