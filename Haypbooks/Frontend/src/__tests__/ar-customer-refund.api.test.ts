import { seedIfNeeded, db, createCreditMemo, createCustomerRefund, listCustomerRefunds, closePeriod, reopenPeriodWithAudit } from '@/mock/db'

describe('A/R Customer Refund (Refund Receipt) flow', () => {
  beforeEach(() => {
    // reset seed
    (db.accounts || []).length = 0
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
    db.customerPayments = []
    db.deposits = []
    ;(db as any).creditMemos = []
    db.customerRefunds = []
    seedIfNeeded()
  })

  test('refund reduces credit memo remaining and posts AR/Cash journal', () => {
    const cust = db.customers[0]
    const cm = createCreditMemo({ customerId: cust.id, lines: [{ description: 'Return', amount: 120 }], date: '2025-01-20' })
    expect(cm.remaining).toBe(120)
    const rf = createCustomerRefund({ customerId: cust.id, creditMemoId: cm.id, amount: 50, date: '2025-01-21' })
    expect(rf.amount).toBe(50)
    const updated = (db as any).creditMemos.find((x: any) => x.id === cm.id)
    expect(updated.remaining).toBe(70)
    // Journal posted: one entry with DR 1100, CR 1000 for 50
    const je = db.journalEntries?.find(j => j.id === rf.journalEntryId)
    expect(je).toBeTruthy()
    const acc1100 = db.accounts.find(a => a.number === '1100')!
    const acc1000 = db.accounts.find(a => a.number === '1000')!
    const dr = je!.lines.find(l => l.accountId === acc1100.id)!
    const cr = je!.lines.find(l => l.accountId === acc1000.id)!
    expect(dr.debit).toBe(50)
    expect(cr.credit).toBe(50)
  })

  test('refund creation blocked in closed period', () => {
    const cust = db.customers[0]
    const cm = createCreditMemo({ customerId: cust.id, lines: [{ description: 'Adj', amount: 30 }], date: '2025-01-10' })
    closePeriod('2025-01-15')
    expect(() => createCustomerRefund({ customerId: cust.id, creditMemoId: cm.id, amount: 10, date: '2025-01-12' })).toThrow(/closed period/i)
    // Next open date ok
    const rf = createCustomerRefund({ customerId: cust.id, creditMemoId: cm.id, amount: 10, date: '2025-01-16' })
    expect(rf.amount).toBe(10)
  })

  test('list endpoint returns refunds filtered by customer', () => {
    const custA = db.customers[0]
    const custB = db.customers[1]
    const cmA = createCreditMemo({ customerId: custA.id, lines: [{ description: 'Adj', amount: 40 }], date: '2025-01-18' })
    const cmB = createCreditMemo({ customerId: custB.id, lines: [{ description: 'Adj', amount: 25 }], date: '2025-01-18' })
    createCustomerRefund({ customerId: custA.id, creditMemoId: cmA.id, amount: 10, date: '2025-01-19' })
    createCustomerRefund({ customerId: custB.id, creditMemoId: cmB.id, amount: 5, date: '2025-01-19' })
    const all = listCustomerRefunds()
    expect(all.length).toBeGreaterThanOrEqual(2)
    const aOnly = listCustomerRefunds({ customerId: custA.id })
    expect(aOnly.every(r => r.customerId === custA.id)).toBe(true)
  })
})
