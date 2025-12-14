import { GET as JSON_GET } from '@/app/api/reports/transaction-list-with-splits/route'
import { GET as CSV_GET } from '@/app/api/reports/transaction-list-with-splits/export/route'

const mk = (u: string) => new Request(u)

describe('Transaction List with Splits CSV export - CSV-Version behavior', () => {
  it('omits CSV-Version by default and includes when opted-in', async () => {
    const j: any = await JSON_GET(new Request('http://test/api/reports/transaction-list-with-splits'))
    expect(j.status).toBe(200)

    const no: any = await CSV_GET(mk('http://test/api/reports/transaction-list-with-splits/export'))
    expect(no.status).toBe(200)
    const noLines = (await no.text()).trimEnd().split('\n')
    expect(noLines[0].startsWith('CSV-Version')).toBe(false)

    const yes: any = await CSV_GET(mk('http://test/api/reports/transaction-list-with-splits/export?csvVersion=1'))
    expect(yes.status).toBe(200)
    const yesLines = (await yes.text()).trimEnd().split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1].length).toBeGreaterThan(0) // caption
    expect(yesLines[2]).toBe('') // spacer
    expect(yesLines[3]).toBe('Txn ID,Date,Type,Number,Payee,Memo,Split Account,Debit,Credit')
  })
})
import { GET as JSONHandler } from '@/app/api/reports/transaction-list-with-splits/route'
import { GET as CSVHandler } from '@/app/api/reports/transaction-list-with-splits/export/route'

const makeReq = (url: string) => new Request(url)

describe('Transaction List with Splits CSV-Version opt-in', () => {
  it('omits CSV-Version by default', async () => {
    const jsonRes: any = await JSONHandler(makeReq('http://test/api/reports/transaction-list-with-splits'))
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await CSVHandler(makeReq('http://test/api/reports/transaction-list-with-splits/export'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const first = text.split('\n',1)[0]
    expect(first.startsWith('CSV-Version')).toBe(false)
  })

  it('includes CSV-Version,1 when opted-in', async () => {
    const csvRes: any = await CSVHandler(makeReq('http://test/api/reports/transaction-list-with-splits/export?csvVersion=1'))
    expect(csvRes.status).toBe(200)
    const text = await csvRes.text()
    const lines = text.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
    expect(lines[3]).toBe('Txn ID,Date,Type,Number,Payee,Memo,Split Account,Debit,Credit')
  })
})
