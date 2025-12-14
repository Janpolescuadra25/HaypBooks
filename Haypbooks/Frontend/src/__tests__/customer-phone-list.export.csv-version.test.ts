import { GET as Export } from '@/app/api/reports/customer-phone-list/export/route'

const make = (u: string) => new Request(u)

describe('customer-phone-list CSV-Version opt-in', () => {
  it('omits by default', async () => {
    const res: any = await Export(make('http://test/api/reports/customer-phone-list/export') as any)
    const body = await res.text()
    expect(body.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)
  })
  it('includes when flagged', async () => {
    const res: any = await Export(make('http://test/api/reports/customer-phone-list/export?csvVersion=1') as any)
    const body = await res.text()
    expect(body.split('\n',1)[0]).toBe('CSV-Version,1')
  })
})
