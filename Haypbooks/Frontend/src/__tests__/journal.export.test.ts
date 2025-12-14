import { GET as JOURNAL_EXP } from '@/app/api/reports/journal/export/route'

const makeReq = (url: string) => new Request(url)

describe('Journal CSV export', () => {
  test('includes caption, header, totals, and filename', async () => {
    const url = 'http://localhost/api/reports/journal/export?period=YTD&end=2025-09-04'
    const res: any = await JOURNAL_EXP(makeReq(url))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    // Caption on first line resolves to As of <date> or <start - end>
    expect(lines[0].length).toBeGreaterThan(0)
    // Spacer then header row at index 2
    expect(lines[2]).toBe('Journal No,Date,Memo,Debits,Credits')
    // Totals row exists and starts with Total
    expect(lines[lines.length - 1].startsWith('Total')).toBe(true)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain('journal-asof-2025-09-04')
  })

  test('CSV-Version opt-in emits version line first', async () => {
    const url = 'http://localhost/api/reports/journal/export?csvVersion=1&end=2025-09-04'
    const res: any = await JOURNAL_EXP(makeReq(url))
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    expect(lines[0]).toBe('CSV-Version,1')
  })
})
