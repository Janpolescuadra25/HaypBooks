import { GET as ExpCsv } from '@/app/api/expenses/export/route'

const makeReq = (url: string) => new Request(url)

describe('Expenses CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const res: any = await ExpCsv(makeReq('http://test/api/expenses/export'))
    const body = await res.text()
    const first = body.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const res: any = await ExpCsv(makeReq('http://test/api/expenses/export?csvVersion=1'))
    const body = await res.text()
    const lines = body.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
