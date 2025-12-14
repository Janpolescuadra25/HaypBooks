import { GET as JSON_GET } from '@/app/api/reports/adjusted-trial-balance/route'
import { GET as CSV_GET } from '@/app/api/reports/adjusted-trial-balance/export/route'

const makeReq = (url: string) => new Request(url)

describe('Adjusted Trial Balance CSV-Version opt-in', () => {
  it('omits CSV-Version by default; includes when opted-in', async () => {
    const jsonRes: any = await JSON_GET(makeReq('http://test/api/reports/adjusted-trial-balance'))
    expect(jsonRes.status).toBe(200)

    const noVer: any = await CSV_GET(makeReq('http://test/api/reports/adjusted-trial-balance/export?end=2025-09-04'))
    const noText = await noVer.text()
    const noLines = noText.split(/\r?\n/)
    expect(noLines[0].startsWith('CSV-Version')).toBe(false)

    const yesVer: any = await CSV_GET(makeReq('http://test/api/reports/adjusted-trial-balance/export?end=2025-09-04&csvVersion=1'))
    const yesText = await yesVer.text()
    const yesLines = yesText.split(/\r?\n/)
    expect(yesLines[0]).toBe('CSV-Version,1')
    // Expect standard structure: [0]=version, [1]=caption, [2]=spacer, [3]=header
    expect(yesLines[1]).toBeTruthy()
    expect(yesLines[2]).toBe('')
    expect(yesLines[3]).toBe('Account,Name,Unadj Debit,Unadj Credit,Adj Debit,Adj Credit,Final Debit,Final Credit')
  })
})
