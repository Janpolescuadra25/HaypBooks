import { GET as Export } from '@/app/api/periods/export/route'

const make = (u: string) => new Request(u)

describe('periods export CSV-Version opt-in', () => {
  it('omits by default', async () => {
    const res: any = await Export(undefined as any)
    const body = await res.text()
    expect(body.split('\n',1)[0].startsWith('CSV-Version')).toBe(false)
  })
  it('includes when flagged', async () => {
    const res: any = await Export(make('http://test/api/periods/export?csvVersion=1') as any)
    const body = await res.text()
    expect(body.split('\n',1)[0]).toBe('CSV-Version,1')
  })
})
