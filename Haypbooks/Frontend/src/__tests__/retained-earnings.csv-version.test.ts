import { GET as RE_CSV } from '@/app/api/reports/retained-earnings/export/route'

function makeReq(url: string) {
  return new Request(url)
}

describe('Retained Earnings CSV-Version opt-in', () => {
  it('omits CSV-Version by default; includes when opted-in', async () => {
    const no = await RE_CSV(makeReq('http://localhost/api/reports/retained-earnings/export?period=YTD&end=2025-09-05')) as any
    const noText = await no.text()
    expect(noText.split(/\r?\n/, 1)[0].startsWith('CSV-Version')).toBe(false)

    const yes = await RE_CSV(makeReq('http://localhost/api/reports/retained-earnings/export?period=YTD&end=2025-09-05&csvVersion=1')) as any
    const yesText = await yes.text()
    expect(yesText.split(/\r?\n/)[0]).toBe('CSV-Version,1')
  })
})
