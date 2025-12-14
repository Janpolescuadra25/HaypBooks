import { GET as JSON_GET } from '@/app/api/reports/transactions-by-customer/route'
import { GET as CSV_GET } from '@/app/api/reports/transactions-by-customer/export/route'
import { setRoleOverride } from '@/lib/rbac-server'

const makeReq = (url: string) => new Request(url)

describe('Transactions by Customer CSV-Version opt-in', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('omits CSV-Version by default (no flag)', async () => {
    setRoleOverride('admin' as any)
    const jsonRes: any = await JSON_GET(makeReq('http://test/api/reports/transactions-by-customer'))
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await CSV_GET(makeReq('http://test/api/reports/transactions-by-customer/export'))
    expect(csvRes.status).toBe(200)
    const body = await csvRes.text()
    const firstLine = body.split(/\r?\n/, 1)[0]
    expect(firstLine.startsWith('CSV-Version')).toBe(false)
  })

  test('includes CSV-Version,1 when csvVersion flag is present', async () => {
    setRoleOverride('admin' as any)
    const csvRes: any = await CSV_GET(makeReq('http://test/api/reports/transactions-by-customer/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const lines = (await csvRes.text()).split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
    // Next line should be the caption, then a blank spacer, then header
    expect(lines[1]).toBeTruthy()
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('Date,Type,Number,Customer,Memo,Amount')
  })
})
