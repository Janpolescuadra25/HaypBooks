import { GET as TDAJSON } from '@/app/api/reports/transaction-detail-by-account/route'
import { GET as TDACSV } from '@/app/api/reports/transaction-detail-by-account/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction Detail by Account CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const jsonRes: any = await TDAJSON(makeReq('http://test/api/reports/transaction-detail-by-account'))
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await TDACSV(makeReq('http://test/api/reports/transaction-detail-by-account/export'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const firstLine = text.split('\n',1)[0]
    expect(firstLine.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await TDACSV(makeReq('http://test/api/reports/transaction-detail-by-account/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
    expect(lines[3]).toBe('Account,Date,Memo,Debit,Credit')
  })
})
