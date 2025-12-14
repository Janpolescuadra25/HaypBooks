import { GET as PL_JSON } from '@/app/api/reports/profit-loss/route'
import { GET as PL_CSV } from '@/app/api/reports/profit-loss/export/route'

const makeReq = (url: string) => new Request(url)

describe('Profit & Loss CSV-Version opt-in', () => {
  it('omits CSV-Version by default; caption is first line', async () => {
    const jsonRes: any = await PL_JSON(makeReq('http://test/api/reports/profit-loss'))
    expect(jsonRes.status).toBe(200)

    const csvRes: any = await PL_CSV(makeReq('http://test/api/reports/profit-loss/export?period=YTD&end=2025-01-31'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await PL_CSV(makeReq('http://test/api/reports/profit-loss/export?period=YTD&end=2025-01-31&csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    // caption is next, then header
    expect(lines[2]).toBe('Account,Current')
  })
})
