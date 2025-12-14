import { GET as GET_EXPORT } from '@/app/api/collections/overview/export/route'

function makeReq(url: string): Request {
  return new Request(url)
}

describe('Collections Overview CSV export', () => {
  test('includes header and totals, correct filename with as-of date', async () => {
    const url = 'http://localhost/api/collections/overview/export?asOf=2025-09-04'
    const res: any = await GET_EXPORT(makeReq(url))
    const body = await res.text()
    const disp = res.headers.get('Content-Disposition') as string
    const lines = body.split(/\r?\n/)

    // Header row present
    expect(lines[0]).toBe('Customer,Risk,Open Invoices,Open Balance,Overdue,Net Receivable,Credit Limit,Credit Util %,Days Since Last Pay,Last Payment,Next Due,Last Reminder,Days Since Reminder,Reminder Count,Worst Dunning Stage,Open Promises,Next Promise Date,Promise Aging Days')

    // Totals row present at end
    const last = lines[lines.length - 2] // last line is trailing empty after join with \n
    expect(last.startsWith('Totals,')).toBe(true)

    // Filename format suffix with as-of date
    expect(disp).toContain('collections-overview-asof-2025-09-04')
  })
})
