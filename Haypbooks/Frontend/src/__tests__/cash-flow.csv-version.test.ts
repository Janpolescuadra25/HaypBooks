import { GET as JSON_GET } from '@/app/api/reports/cash-flow/route'
import { GET as CSV_GET } from '@/app/api/reports/cash-flow/export/route'
import { setRoleOverride } from '@/lib/rbac-server'

const makeReq = (url: string) => new Request(url)

describe('Cash Flow CSV-Version opt-in', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('omits CSV-Version by default and caption+header present', async () => {
    setRoleOverride('admin' as any)
    const jsonRes: any = await JSON_GET(makeReq('http://test/api/reports/cash-flow'))
    expect(jsonRes.status).toBe(200)
    const res: any = await CSV_GET(makeReq('http://test/api/reports/cash-flow/export'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).split(/\r?\n/)
    expect(lines[0].startsWith('CSV-Version')).toBe(false)
    expect(lines[0]).toBeTruthy() // caption
    expect(lines[1]).toBe('Section,Current')
  })

  test('includes CSV-Version when flagged', async () => {
    setRoleOverride('admin' as any)
    const res: any = await CSV_GET(makeReq('http://test/api/reports/cash-flow/export?csvVersion=1'))
    expect(res.status).toBe(200)
    const lines = (await res.text()).split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('Section,Current')
  })
})
