import { GET as GET_EXPORT } from '@/app/api/reports/budget-vs-actual/export/route'

function makeReq(url: string) { return new Request(url) }

describe('Budget vs Actual CSV-Version opt-in', () => {
  it('omits CSV-Version by default; includes when opted-in', async () => {
    const no = await GET_EXPORT(makeReq('http://localhost/api/reports/budget-vs-actual/export?period=Today')) as any
    const noText = await no.text()
    expect(noText.split(/\r?\n/,1)[0].startsWith('CSV-Version')).toBe(false)

    const yes = await GET_EXPORT(makeReq('http://localhost/api/reports/budget-vs-actual/export?period=Today&csvVersion=1')) as any
    const yesText = await yes.text()
    expect(yesText.split(/\r?\n/)[0]).toBe('CSV-Version,1')
  })
})
