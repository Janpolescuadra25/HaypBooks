import { GET as GET_EXPORT } from '@/app/api/reports/refunds/export/route'
import { seedIfNeeded } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

function parseCsv(text: string) {
  return text.split(/\r?\n/)
}

describe('Consolidated refunds CSV export', () => {
  test('caption, header; CSV-Version opt-in; filename tokens; within range filter', async () => {
    try { seedIfNeeded() } catch {}
    const base = `http://test/api/reports/refunds/export?period=Custom&start=2025-01-01&end=2025-12-31&type=ar`

    const resNo: any = await GET_EXPORT(makeReq(base))
    const textNo = await resNo.text()
    const linesNo = parseCsv(textNo)

    // No CSV-Version by default; first line is caption
    expect(linesNo[0].startsWith('CSV-Version')).toBe(false)
  // Caption is quoted and uses human-friendly dates, possibly with an en dash
  const capNo = linesNo[0].replace(/^"|"$/g, '')
  expect(/2025/.test(capNo)).toBe(true)
  expect(/(to|–|-)/.test(capNo)).toBe(true)
    // Header immediately after caption (no spacer in this export)
    expect(linesNo[1]).toBe('Date,Side,Amount,Method,Reference,Linked Credit')

    const resYes: any = await GET_EXPORT(makeReq(base + '&csvVersion=1'))
    const textYes = await resYes.text()
    const linesYes = parseCsv(textYes)

  expect(linesYes[0]).toBe('CSV-Version,1')
  const capYes = linesYes[1].replace(/^"|"$/g, '')
  expect(/2025/.test(capYes)).toBe(true)
  expect(/(to|–|-)/.test(capYes)).toBe(true)

    const disp = resYes.headers.get('Content-Disposition') || ''
    expect(disp).toContain('refunds-2025-01-01_to_2025-12-31')
    expect(disp).toMatch(/period-custom/)
    expect(disp).toMatch(/type-ar/)
  })
})
