import { GET as GET_EXPORT } from '@/app/api/reports/check-detail/export/route'

function makeReq(url: string): Request {
  return new Request(url)
}

describe('Check Detail CSV export', () => {
  test('includes caption, header, filename, and totals row', async () => {
    const url = 'http://localhost/api/reports/check-detail/export?start=2025-09-01&end=2025-09-07'
    const res: any = await GET_EXPORT(makeReq(url))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)

    // Range caption
    expect(lines[0]).toBe('2025-09-01 - 2025-09-07')

    // Header row
    expect(lines[2]).toBe('Date,Number,Payee,Account,Memo,Amount')

    // Filename as-of end date
    expect(disp).toContain('check-detail-asof-2025-09-07')

    // Totals row exists
    const totalsLine = lines.find((l: string) => l.startsWith('Totals,')) as string
    expect(totalsLine).toBeTruthy()
  })
})
