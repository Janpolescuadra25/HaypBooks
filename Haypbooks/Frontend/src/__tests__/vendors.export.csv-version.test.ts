import { GET as VendorsCsv } from '@/app/api/vendors/export/route'

const makeReq = (url: string) => new Request(url)

describe('Vendors CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await VendorsCsv(makeReq('http://test/api/vendors/export'))
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await VendorsCsv(makeReq('http://test/api/vendors/export?csvVersion=1'))
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
