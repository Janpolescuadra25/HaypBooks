import { GET as CF_JSON } from '@/app/api/reports/cash-flow/route'
import { GET as CF_CSV } from '@/app/api/reports/cash-flow/export/route'

const makeReq = (url: string) => new Request(url)

describe('Cash Flow CSV-Version opt-in', () => {
  it('omits CSV-Version by default; caption is first line', async () => {
    const jsonRes: any = await CF_JSON(makeReq('http://test/api/reports/cash-flow'))
    expect(jsonRes.status).toBe(200)

    const csvRes: any = await CF_CSV(makeReq('http://test/api/reports/cash-flow/export?period=YTD&end=2025-01-31'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await CF_CSV(makeReq('http://test/api/reports/cash-flow/export?period=YTD&end=2025-01-31&csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    // caption is next, then header
    expect(lines[2]).toBe('Section,Current')
  })
})
