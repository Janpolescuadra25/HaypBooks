import { GET as TLBD_EXP } from '@/app/api/reports/transaction-list-by-date/export/route'
import { formatAsOf } from '@/lib/date'

const makeReq = (url: string) => new Request(url)

describe('Transaction List by Date CSV export', () => {
  test('includes caption, header, trailing Total, and as-of filename', async () => {
    const end = '2025-09-04'
    const res: any = await TLBD_EXP(makeReq(`http://localhost/api/reports/transaction-list-by-date/export?end=${end}`))
    expect(res.status).toBe(200)
    const cd = res.headers.get('Content-Disposition') as string
    expect(cd).toContain(`transaction-list-by-date-asof-${end}`)
  const text = await res.text()
  const lines = text.split(/\r?\n/)
  // Caption row, blank spacer, header (caption quoted due to comma from long date)
  const caption = lines[0].replace(/^"|"$/g, '')
  expect(caption).toBe(`As of ${formatAsOf(end)}`)
    expect(lines[2]).toBe('Date,Type,Number,Name,Memo,Debit,Credit')
    // Last line should start with Total
    expect(lines[lines.length - 1].startsWith('Total')).toBe(true)
  })
})
