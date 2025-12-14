import { GET as PACK_CSV } from '@/app/api/reports/pack/export/route'

describe('Management pack CSV-Version opt-in', () => {
  it('omits CSV-Version by default; includes when opted-in', async () => {
    const no = await PACK_CSV(new Request('http://localhost/api/reports/pack/export?reports=profit-loss,trial-balance&preset=YTD')) as any
    const noText = await no.text()
    expect(noText.split(/\r?\n/,1)[0].startsWith('CSV-Version')).toBe(false)

    const yes = await PACK_CSV(new Request('http://localhost/api/reports/pack/export?reports=profit-loss,trial-balance&preset=YTD&csvVersion=1')) as any
    const yesText = await yes.text()
    expect(yesText.split(/\r?\n/)[0]).toBe('CSV-Version,1')
  })
})
