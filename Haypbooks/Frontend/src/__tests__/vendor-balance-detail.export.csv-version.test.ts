import { GET as VBD_EXP } from '@/app/api/reports/vendor-balance-detail/export/route'

const makeReq = (url: string) => new Request(url)

describe('Vendor Balance Detail CSV export — CSV-Version prelude', () => {
  it('default: no CSV-Version row; opt-in includes CSV-Version,1', async () => {
    const base = 'http://local/api/reports/vendor-balance-detail/export?end=2025-01-31'
    const no: any = await VBD_EXP(makeReq(base))
    const noText = await no.text()
    const noLines = noText.split(/\r?\n/)
    expect(noLines[0]).not.toBe('CSV-Version,1')

    const yes: any = await VBD_EXP(makeReq(base + '&csvVersion=1'))
    const yesText = await yes.text()
    const yesLines = yesText.split(/\r?\n/)
    expect(yesLines[0]).toBe('CSV-Version,1')
  })
})
