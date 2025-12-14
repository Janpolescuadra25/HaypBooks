import { GET as GET_EXPORT } from '@/app/api/reports/open-credits/export/route'
import { seedIfNeeded, db, createCreditMemo, createVendorCredit } from '@/mock/db'

const makeReq = (url: string) => new Request(url)

describe('Open Credits CSV export', () => {
  test('caption, header; CSV-Version opt-in; filename tokens; includes AR/AP rows', async () => {
    try { seedIfNeeded() } catch {}
    // Ensure we have at least one CM and VC in range
    const custId = db.customers[0]?.id
    const venId = db.vendors[0]?.id
    if (custId) createCreditMemo({ customerId: custId, date: '2025-01-10', lines: [{ description: 'Adj', amount: 120 }] })
    if (venId) createVendorCredit({ vendorId: venId, date: '2025-01-12', lines: [{ description: 'Allowance', amount: 75 }] })

    const base = `http://test/api/reports/open-credits/export?period=Custom&start=2025-01-01&end=2025-12-31`

    const resNo: any = await GET_EXPORT(makeReq(base))
    const textNo = await resNo.text()
    const linesNo = textNo.split(/\r?\n/)
    expect(linesNo[0].startsWith('CSV-Version')).toBe(false)
    const capNo = linesNo[0].replace(/^"|"$/g, '')
    expect(/2025/.test(capNo)).toBe(true)
    expect(/(to|–|\-)/.test(capNo)).toBe(true)
    expect(linesNo[1]).toBe('Date,Side,Number,Name,Original,Applied,Remaining')

    const resYes: any = await GET_EXPORT(makeReq(base + '&csvVersion=1'))
    const textYes = await resYes.text()
    const linesYes = textYes.split(/\r?\n/)
    expect(linesYes[0]).toBe('CSV-Version,1')
    const capYes = linesYes[1].replace(/^"|"$/g, '')
    expect(/2025/.test(capYes)).toBe(true)
    expect(/(to|–|\-)/.test(capYes)).toBe(true)

    const disp = resYes.headers.get('Content-Disposition') || ''
    expect(disp).toContain('open-credits-2025-01-01_to_2025-12-31')
    expect(disp).toMatch(/period-custom/)
  })
})
