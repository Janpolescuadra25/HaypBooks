import { GET as DD_JSON } from '@/app/api/reports/deposit-detail/route'
import { GET as DD_CSV } from '@/app/api/reports/deposit-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Deposit Detail CSV-Version opt-in', () => {
  it('omits CSV-Version by default; caption is first line', async () => {
    const jsonRes: any = await DD_JSON(makeReq('http://test/api/reports/deposit-detail'))
    expect(jsonRes.status).toBe(200)

    const csvRes: any = await DD_CSV(makeReq('http://test/api/reports/deposit-detail/export?end=2025-01-31'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await DD_CSV(makeReq('http://test/api/reports/deposit-detail/export?end=2025-01-31&csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toMatch(/^\d{4}-\d{2}-\d{2}|As of|to /)
    expect(lines[2]).toBe('')
    expect(lines[3]).toBe('Date,Deposit ID,Deposit To,Memo,Payments,Total')
  })
})
