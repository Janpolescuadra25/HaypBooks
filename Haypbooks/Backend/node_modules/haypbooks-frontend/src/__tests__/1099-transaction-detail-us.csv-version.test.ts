import { GET as GET_EXPORT } from '@/app/api/reports/1099-transaction-detail-us/export/route'

describe('1099 Transaction Detail CSV-Version opt-in', () => {
  it('omits CSV-Version by default; includes when opted-in', async () => {
    const no = await GET_EXPORT(new Request('http://localhost/api/reports/1099-transaction-detail-us/export?period=YTD&end=2025-09-30')) as any
    const noText = await no.text()
    expect(noText.split(/\r?\n/,1)[0].startsWith('CSV-Version')).toBe(false)

    const yes = await GET_EXPORT(new Request('http://localhost/api/reports/1099-transaction-detail-us/export?period=YTD&end=2025-09-30&csvVersion=1')) as any
    const yesText = await yes.text()
    expect(yesText.split(/\r?\n/)[0]).toBe('CSV-Version,1')
  })
})
