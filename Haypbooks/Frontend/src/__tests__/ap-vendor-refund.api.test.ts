import { seedIfNeeded, db, createVendorCredit, createVendorRefund, listVendorRefunds, closePeriod } from '@/mock/db'

describe('A/P Vendor Refund flow', () => {
  beforeEach(() => {
    // reset seed
    ;(db.accounts || []).length = 0
    db.transactions.length = 0
    db.invoices.length = 0
    db.bills.length = 0
    db.customers.length = 0
    db.vendors.length = 0
    db.items.length = 0
    db.journalEntries = []
    db.auditEvents = []
    db.seeded = false
    db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }
    db.vendorRefunds = []
    db.vendorCredits = []
    seedIfNeeded()
  })

  test('refund reduces vendor credit remaining and posts Cash/AP journal', () => {
    const ven = db.vendors[0]
    const vc = createVendorCredit({ vendorId: ven.id, lines: [{ description: 'Return', amount: 120 }], date: '2025-01-20' })
    expect(vc.remaining).toBe(120)
    const rf = createVendorRefund({ vendorId: ven.id, vendorCreditId: vc.id, amount: 50, date: '2025-01-21' })
    expect(rf.amount).toBe(50)
    const updated = (db.vendorCredits || []).find((x: any) => x.id === vc.id)!
    expect(updated.remaining).toBe(70)
    // Journal posted: DR 1000, CR 2000 for 50
    const je = db.journalEntries?.find(j => j.id === rf.journalEntryId)
    expect(je).toBeTruthy()
    const acc1000 = db.accounts.find(a => a.number === '1000')!
    const acc2000 = db.accounts.find(a => a.number === '2000')!
    const dr = je!.lines.find(l => l.accountId === acc1000.id)!
    const cr = je!.lines.find(l => l.accountId === acc2000.id)!
    expect(dr.debit).toBe(50)
    expect(cr.credit).toBe(50)
  })

  test('refund creation blocked in closed period', () => {
    const ven = db.vendors[0]
    const vc = createVendorCredit({ vendorId: ven.id, lines: [{ description: 'Adj', amount: 30 }], date: '2025-01-10' })
    closePeriod('2025-01-15')
    expect(() => createVendorRefund({ vendorId: ven.id, vendorCreditId: vc.id, amount: 10, date: '2025-01-12' })).toThrow(/closed period/i)
    // Next open date ok
    const rf = createVendorRefund({ vendorId: ven.id, vendorCreditId: vc.id, amount: 10, date: '2025-01-16' })
    expect(rf.amount).toBe(10)
  })

  test('list endpoint returns refunds filtered by vendor', () => {
    const venA = db.vendors[0]
    const venB = db.vendors[1]
    const vcA = createVendorCredit({ vendorId: venA.id, lines: [{ description: 'Adj', amount: 40 }], date: '2025-01-18' })
    const vcB = createVendorCredit({ vendorId: venB.id, lines: [{ description: 'Adj', amount: 25 }], date: '2025-01-18' })
    createVendorRefund({ vendorId: venA.id, vendorCreditId: vcA.id, amount: 10, date: '2025-01-19' })
    createVendorRefund({ vendorId: venB.id, vendorCreditId: vcB.id, amount: 5, date: '2025-01-19' })
    const all = listVendorRefunds()
    expect(all.length).toBeGreaterThanOrEqual(2)
    const aOnly = listVendorRefunds({ vendorId: venA.id })
    expect(aOnly.every(r => r.vendorId === venA.id)).toBe(true)
  })
})
