import { GET } from '@/app/api/reports/deposit-detail/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Deposit Detail CSV export', () => {
  it('returns CSV with as-of caption and correct headers/filename', async () => {
    const end = '2025-01-31'
    const res: any = await GET(makeReq(`http://localhost/api/reports/deposit-detail/export?end=${end}`))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')

    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain(`deposit-detail-asof-${end}`)

    const body = await res.text()
    const lines = body.split(/\r?\n/)
    expect(lines[0]).toContain('As of')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe('Date,Deposit ID,Deposit To,Memo,Payments,Total')

    // Totals row should be present as the last non-empty line
  const nonEmpty = lines.filter((l: string) => l.trim().length > 0)
    const last = nonEmpty[nonEmpty.length - 1]
    expect(last.startsWith(',,,Totals,')).toBe(true)
  })
})
