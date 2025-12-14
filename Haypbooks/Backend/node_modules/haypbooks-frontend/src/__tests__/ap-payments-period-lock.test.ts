import { seedIfNeeded, db, closePeriod, reopenPeriodWithAudit, createBill, applyPaymentToBill, createVendorCredit, applyVendorCreditToBill } from '@/mock/db'

describe('A/P payments and credits respect closed periods', () => {
  beforeEach(() => {
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
    if ((db as any).vendorCredits) (db as any).vendorCredits.length = 0
    seedIfNeeded()
  })

  test('applyPaymentToBill throws in closed period; succeeds after reopen', () => {
    const ven = db.vendors[0]
    const bill = createBill({ vendorId: ven.id, billDate: '2025-03-10', terms: 'Net 0', lines: [{ description: 'Svc', amount: 100 }] })
    const todayIso = new Date().toISOString().slice(0,10)
    closePeriod(todayIso)
    expect(() => applyPaymentToBill(bill.id, 20)).toThrow(/closed period/i)
    reopenPeriodWithAudit()
    const { bill: updated } = applyPaymentToBill(bill.id, 20)
    expect(updated.balance).toBeGreaterThanOrEqual(80)
  })

  test('applyVendorCreditToBill throws in closed period; succeeds after reopen', () => {
    const ven = db.vendors[1]
    const bill = createBill({ vendorId: ven.id, billDate: '2025-03-11', terms: 'Net 0', lines: [{ description: 'Svc', amount: 150 }] })
    const vc = createVendorCredit({ vendorId: ven.id, date: '2025-03-12', lines: [{ description: 'Allow', amount: 50 }] })
    const todayIso = new Date().toISOString().slice(0,10)
    closePeriod(todayIso)
    expect(() => applyVendorCreditToBill(vc.id, bill.id, 30)).toThrow(/closed period/i)
    reopenPeriodWithAudit()
    const { bill: updated } = applyVendorCreditToBill(vc.id, bill.id, 30)
    expect(updated.balance).toBeGreaterThanOrEqual(120)
  })
})
