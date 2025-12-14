import { GET as VBS_EXP } from '@/app/api/reports/vendor-balance-summary/export/route'

const makeReq = (url: string) => new Request(url)

describe('Vendor Balance Summary CSV export — CSV-Version prelude', () => {
  it('default: no CSV-Version row; opt-in includes CSV-Version,1', async () => {
    const base = 'http://local/api/reports/vendor-balance-summary/export?end=2025-01-31'
    const no: any = await VBS_EXP(makeReq(base))
    const noText = await no.text()
    const noLines = noText.split(/\r?\n/)
    expect(noLines[0]).not.toBe('CSV-Version,1')

    const yes: any = await VBS_EXP(makeReq(base + '&csvVersion=1'))
    const yesText = await yes.text()
    const yesLines = yesText.split(/\r?\n/)
    expect(yesLines[0]).toBe('CSV-Version,1')
  })
})
