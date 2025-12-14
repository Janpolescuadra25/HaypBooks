import { GET as JSONHandler } from '@/app/api/reports/transaction-list-by-date/route'
import { GET as CSVHandler } from '@/app/api/reports/transaction-list-by-date/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction List by Date CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const jsonRes: any = await JSONHandler(makeReq('http://test/api/reports/transaction-list-by-date'))
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await CSVHandler(makeReq('http://test/api/reports/transaction-list-by-date/export'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n',1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await CSVHandler(makeReq('http://test/api/reports/transaction-list-by-date/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
    expect(lines[3]).toBe('Date,Type,Number,Name,Memo,Debit,Credit')
  })
})
