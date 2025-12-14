import { GET as LedgerJSON } from '@/app/api/reports/account-ledger/route'
import { GET as LedgerCSV } from '@/app/api/reports/account-ledger/export/route'

const makeReq = (url: string) => new Request(url)

describe('Account Ledger CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const jsonRes: any = await LedgerJSON(makeReq('http://test/api/reports/account-ledger?account=1000'))
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await LedgerCSV(makeReq('http://test/api/reports/account-ledger/export?account=1000'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const firstLine = text.split('\n',1)[0]
    expect(firstLine.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted in', async () => {
    const csvRes: any = await LedgerCSV(makeReq('http://test/api/reports/account-ledger/export?account=1000&csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
    expect(lines[3]).toBe('Date,Memo,Debit,Credit,Balance')
  })
})
