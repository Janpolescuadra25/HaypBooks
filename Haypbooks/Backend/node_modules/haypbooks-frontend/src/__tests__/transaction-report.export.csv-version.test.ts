import { GET as JSONHandler } from '@/app/api/reports/transaction-report/route'
import { GET as CSVHandler } from '@/app/api/reports/transaction-report/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction Report CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const jsonRes: any = await JSONHandler(makeReq('http://test/api/reports/transaction-report'))
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await CSVHandler(makeReq('http://test/api/reports/transaction-report/export'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n',1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await CSVHandler(makeReq('http://test/api/reports/transaction-report/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
    expect(lines[3]).toBe('ID,Date,Type,Number,Name,Memo,Amount')
  })
})
