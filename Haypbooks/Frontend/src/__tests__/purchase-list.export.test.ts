import { GET as GET_EXPORT } from '@/app/api/reports/purchase-list/export/route'

const makeReq = (url: string) => new Request(url)

describe('Purchase List CSV export', () => {
  test('includes caption, header, filename, and totals row', async () => {
    const url = 'http://localhost/api/reports/purchase-list/export?start=2025-09-01&end=2025-09-07'
    const res: any = await GET_EXPORT(makeReq(url))
    const body = await res.text()
    const cd = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)

    expect(lines[0]).toBe('2025-09-01 - 2025-09-07')
    expect(lines[2]).toBe('Date,Type,Number,Vendor,Account,Memo,Amount')
    expect(cd).toContain('purchase-list-asof-2025-09-07')
  const totals = lines.find((l: string) => l.startsWith('Totals,'))
    expect(totals).toBeTruthy()
  })
})
