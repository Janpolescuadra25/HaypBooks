import { GET as ReconSummaryJSON } from '@/app/api/reconciliation/summary/route'
import { GET as ReconSummaryCSV } from '@/app/api/reconciliation/summary/export/route'
import { GET as ReconAcctJSON } from '@/app/api/reconciliation/progress-by-account/route'
import { GET as ReconAcctCSV } from '@/app/api/reconciliation/progress-by-account/export/route'

const makeReq = (url: string) => new Request(url)

describe('Reconciliation exports CSV-Version opt-in', () => {
  it('summary: omits CSV-Version by default; includes when opted-in', async () => {
    const j: any = await ReconSummaryJSON()
    expect(j.status).toBe(200)

    const csvNo: any = await ReconSummaryCSV(makeReq('http://test/api/reconciliation/summary/export'))
    expect(csvNo.status).toBe(200)
    const noBody = await csvNo.text()
    const noFirst = noBody.split('\n', 1)[0]
    expect(noFirst.startsWith('CSV-Version')).toBe(false)

    const csvYes: any = await ReconSummaryCSV(makeReq('http://test/api/reconciliation/summary/export?csvVersion=1'))
    expect(csvYes.status).toBe(200)
    const yesLines = (await csvYes.text()).split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1]).toBeTruthy() // caption
    expect(yesLines[2]).toBe('') // spacer
    expect(yesLines[3].startsWith('Status,Count')).toBe(true)
  })

  it('progress-by-account: omits CSV-Version by default; includes when opted-in', async () => {
    const j: any = await ReconAcctJSON()
    expect(j.status).toBe(200)

    const csvNo: any = await ReconAcctCSV(makeReq('http://test/api/reconciliation/progress-by-account/export'))
    expect(csvNo.status).toBe(200)
    const noBody = await csvNo.text()
    const noFirst = noBody.split('\n', 1)[0]
    expect(noFirst.startsWith('CSV-Version')).toBe(false)

    const csvYes: any = await ReconAcctCSV(makeReq('http://test/api/reconciliation/progress-by-account/export?csvVersion=1'))
    expect(csvYes.status).toBe(200)
    const yesLines = (await csvYes.text()).split('\n')
    expect(yesLines[0]).toBe('CSV-Version,1')
    expect(yesLines[1]).toBeTruthy() // caption
    expect(yesLines[2]).toBe('') // spacer
    expect(yesLines[3].startsWith('Account Number,')).toBe(true)
  })
})
