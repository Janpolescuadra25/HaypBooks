import { GET as CustomersCsv } from '@/app/api/customers/export/route'

const makeReq = (url: string) => new Request(url)

describe('Customers CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await CustomersCsv(makeReq('http://test/api/customers/export'))
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await CustomersCsv(makeReq('http://test/api/customers/export?csvVersion=1'))
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
