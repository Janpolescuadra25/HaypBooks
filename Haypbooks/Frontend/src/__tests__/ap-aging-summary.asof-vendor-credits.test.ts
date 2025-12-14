import { db, seedIfNeeded, createBill, applyPaymentToBill, createVendorCredit, applyVendorCreditToBill } from '@/mock/db'
import { GET as GET_AP_JSON } from '@/app/api/reports/ap-aging/route'

function makeReq(url: string) { return new Request(url, { headers: { cookie: 'role=admin' } as any }) }

describe('AP aging summary as-of respects vendor credits and payments', () => {
  beforeEach(() => {
    // reset db
    ;(db as any).seeded = false
    db.accounts.length = 0
    db.transactions.length = 0
    db.invoices.length = 0
  if (db.estimates) db.estimates.length = 0
    db.bills.length = 0
    db.customers.length = 0
    db.vendors.length = 0
    db.items.length = 0
  if (db.journalEntries) db.journalEntries.length = 0
  if (db.auditEvents) db.auditEvents.length = 0
  if (db.vendorCredits) (db.vendorCredits as any).length = 0
    seedIfNeeded()
  })

  test('credit applied after as-of does not reduce earlier aging', async () => {
    const venId = db.vendors[0].id
    // Create a bill due 2025-02-10 for 300
    const bill = createBill({ vendorId: venId, billDate: '2025-01-10', terms: 'Net 31', lines: [ { description: 'Svc', amount: 300 } ] })
    // As-of 2025-02-15: bill is 5 days past due -> should sit in 1-30 bucket with full 300
    let res: any = await GET_AP_JSON(makeReq('http://localhost/api/reports/ap-aging?asOf=2025-02-15'))
    let data = await res.json()
    const rowPre = data.rows.find((r: any) => r.name.includes('Vendor'))
    expect(rowPre['30']).toBeGreaterThanOrEqual(300)

    // Apply vendor credit of 100 dated 2025-02-20 (after as-of)
    const vc = createVendorCredit({ vendorId: venId, date: '2025-02-20', lines: [ { description: 'Allowance', amount: 100 } ] })
    applyVendorCreditToBill(vc.id, bill.id, 100)

    // Recompute as-of 2025-02-15 should still show 300
    res = await GET_AP_JSON(makeReq('http://localhost/api/reports/ap-aging?asOf=2025-02-15'))
    data = await res.json()
    const row = data.rows.find((r: any) => r.name.includes('Vendor'))
    expect(row['30']).toBeGreaterThanOrEqual(300)

    // As-of 2025-02-25 should reflect reduced balance 200
    res = await GET_AP_JSON(makeReq('http://localhost/api/reports/ap-aging?asOf=2025-02-25'))
    data = await res.json()
    const rowLater = data.rows.find((r: any) => r.name.includes('Vendor'))
    expect(rowLater['30'] + rowLater['60'] + rowLater['90'] + rowLater['120+'] + rowLater.current).toBeGreaterThanOrEqual(200)
  })
})
