import { GET as GL_JSON } from '@/app/api/reports/general-ledger/route'
import { GET as GL_CSV } from '@/app/api/reports/general-ledger/export/route'

const makeReq = (url: string) => new Request(url)

describe('General Ledger CSV-Version opt-in', () => {
  it('omits CSV-Version by default; caption is first line', async () => {
    const jsonRes: any = await GL_JSON(makeReq('http://test/api/reports/general-ledger'))
    expect(jsonRes.status).toBe(200)

    const csvRes: any = await GL_CSV(makeReq('http://test/api/reports/general-ledger/export?period=Custom&start=2025-01-01&end=2025-01-31'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n', 1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await GL_CSV(makeReq('http://test/api/reports/general-ledger/export?period=Custom&start=2025-01-01&end=2025-01-31&csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    // caption, blank, then header
    expect(lines[3]).toBe('Date,Journal,Account,Name,Memo,Debit,Credit,Balance')
  })
})
