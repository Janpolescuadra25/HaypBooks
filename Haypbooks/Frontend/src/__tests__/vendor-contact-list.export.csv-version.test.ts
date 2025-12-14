import { GET as Export } from '@/app/api/reports/vendor-contact-list/export/route'

const make = (u: string) => new Request(u)

describe('vendor-contact-list CSV-Version opt-in', () => {
  it('omits by default', async () => {
    const res: any = await Export(make('http://test/api/reports/vendor-contact-list/export') as any)
    const body = await res.text()
    expect(body.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)
  })
  it('includes when flagged', async () => {
    const res: any = await Export(make('http://test/api/reports/vendor-contact-list/export?csvVersion=1') as any)
    const body = await res.text()
    expect(body.split('\n',1)[0]).toBe('CSV-Version,1')
  })
})
