import { GET as GET_EXPORT } from '@/app/api/reports/vendor-balance-summary/export/route'

const makeReq = (url: string) => new Request(url)

describe('Vendor Balance Summary CSV export', () => {
  test('includes caption, correct header, and filename', async () => {
    const res: any = await GET_EXPORT(makeReq('http://localhost/api/reports/vendor-balance-summary/export?end=2025-09-04'))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toBe('2025-09-04')
    expect(lines[2]).toBe('Vendor,Open Balance')
    expect(disp).toContain('vendor-balance-summary-asof-2025-09-04')
  })

  test('CSV-Version prelude: omits by default; includes when opted-in', async () => {
    const noVer: any = await GET_EXPORT(makeReq('http://localhost/api/reports/vendor-balance-summary/export?end=2025-09-04'))
    const noText = await noVer.text()
    expect(noText.split('\n', 1)[0].startsWith('CSV-Version')).toBe(false)

    const yesVer: any = await GET_EXPORT(makeReq('http://localhost/api/reports/vendor-balance-summary/export?end=2025-09-04&csvVersion=1'))
    const yesText = await yesVer.text()
    expect(yesText.split('\n', 1)[0]).toBe('CSV-Version,1')
  })
})
