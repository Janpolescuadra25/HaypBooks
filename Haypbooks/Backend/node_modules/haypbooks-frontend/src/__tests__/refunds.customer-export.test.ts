import { GET as GET_EXPORT } from '@/app/api/customers/[id]/refunds/export/route'
import { seedIfNeeded, db } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Customer refunds CSV export', () => {
  test('caption, spacer, header; CSV-Version opt-in; filename tokens', async () => {
    try { seedIfNeeded() } catch {}
    const custId = db.customers[0]?.id || 'cust_1'
    const base = `http://test/api/customers/${custId}/refunds/export?asOf=2025-10-01`

    const resNo: any = await GET_EXPORT(makeReq(base), { params: { id: custId } } as any)
    const textNo = await resNo.text()
    const linesNo = textNo.split(/\r?\n/)

    // No CSV-Version by default
    expect(linesNo[0].startsWith('CSV-Version')).toBe(false)
  // First line is caption built via buildCsvCaption with human-friendly date; allow quotes
  const capNo = linesNo[0].replace(/^"|"$/g, '')
  expect(capNo.startsWith('As of ')).toBe(true)
  expect(capNo).toContain('2025')
    // Spacer then header
    expect(linesNo[1]).toBe('')
    expect(linesNo[2]).toBe('Date,Amount,Method,Reference,Linked Credit')

    const resYes: any = await GET_EXPORT(makeReq(base + '&csvVersion=1'), { params: { id: custId } } as any)
    const textYes = await resYes.text()
    const linesYes = textYes.split(/\r?\n/)
  expect(linesYes[0]).toBe('CSV-Version,1')
  const capYes = linesYes[1].replace(/^"|"$/g, '')
  expect(capYes.startsWith('As of ')).toBe(true)
  expect(capYes).toContain('2025')
    expect(linesYes[2]).toBe('')

    const disp = resYes.headers.get('Content-Disposition') || ''
    expect(disp).toContain('customer-refunds-asof-2025-10-01')
    expect(disp).toMatch(/cust-/)
  })
})
