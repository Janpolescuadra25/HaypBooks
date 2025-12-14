import { GET as TB_JSON } from '@/app/api/reports/trial-balance/route'
import { GET as TB_CSV } from '@/app/api/reports/trial-balance/export/route'

const mk = (url: string) => new Request(url)

describe('Trial Balance CSV-Version opt-in', () => {
  it('omits CSV-Version by default; includes when opted-in', async () => {
    const jsonRes: any = await TB_JSON(mk('http://test/api/reports/trial-balance'))
    expect(jsonRes.status).toBe(200)

    const no: any = await TB_CSV(mk('http://test/api/reports/trial-balance/export?end=2025-09-04'))
    const noText = await no.text()
    expect(noText.split(/\r?\n/)[0].startsWith('CSV-Version')).toBe(false)

    const yes: any = await TB_CSV(mk('http://test/api/reports/trial-balance/export?end=2025-09-04&csvVersion=1'))
    const text = await yes.text()
    const lines = text.split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
    expect(lines[1]).toBeTruthy() // caption
    expect(lines[2]).toBe('') // spacer
    expect(lines[3]).toBe('Account,Name,Debit,Credit')
  })
})
