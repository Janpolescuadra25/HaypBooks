import { db, closePeriod, reopenPeriodWithAudit, createInvoice, updateInvoice, applyPaymentToInvoice, createBill, applyPaymentToBill, createCustomerRefund, createVendorRefund } from '@/mock/db'

function reset() {
  db.accounts = [] as any
  db.transactions = [] as any
  db.invoices = [] as any
  db.bills = [] as any
  db.journalEntries = [] as any
  db.auditEvents = [] as any
  db.customers = [] as any
  db.vendors = [] as any
  db.tags = [] as any
  db.seeded = false
  db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }
  db.accounts.push(
    { id: 'acc_1000', number: '1000', name: 'Cash', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_1010', number: '1010', name: 'Undeposited Funds', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_1100', number: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_2000', number: '2000', name: 'Accounts Payable', type: 'Liability', balance: 0, active: true } as any,
    { id: 'acc_4000', number: '4000', name: 'Sales Revenue', type: 'Income', balance: 0, active: true } as any,
    { id: 'acc_6000', number: '6000', name: 'Operating Expenses', type: 'Expense', balance: 0, active: true } as any,
  )
  db.customers.push({ id: 'cust_A', name: 'Customer A' } as any)
  db.vendors.push({ id: 'ven_A', name: 'Vendor A' } as any)
}

describe('Closed period enforcement across flows', () => {
  beforeEach(() => reset())

  test('Reject postings on/before closeDate; allow after reopen', () => {
    db.settings!.accountingMethod = 'accrual'
    closePeriod('2025-04-10')
    const cust = db.customers[0]
    const ven = db.vendors[0]
  // Invoice created on closed date is normalized to next open date; updating to sent should succeed
  const inv = createInvoice({ number: 'INV-PL-1', customerId: cust.id, date: '2025-04-10', lines: [{ description: 'S', amount: 50 }] })
  expect(() => updateInvoice(inv.id, { status: 'sent' })).not.toThrow()
    // Payment dated in closed period should be blocked
    inv.date = '2025-04-11' // move invoice date open for test
    updateInvoice(inv.id, { status: 'sent' })
    expect(() => applyPaymentToInvoice(inv.id, 50, { date: '2025-04-10', fundSource: 'cash' })).toThrow()
    // Bill creation on closed date should error
    expect(() => createBill({ number: 'B-PL-1', vendorId: ven.id, billDate: '2025-04-10', terms: 'Net 0', lines: [{ description: 'X', amount: 25 }] })).toThrow()
    // Refunds on closed date should error
    expect(() => createCustomerRefund({ customerId: cust.id, amount: 10, date: '2025-04-10' })).toThrow()
    expect(() => createVendorRefund({ vendorId: ven.id, amount: 10, date: '2025-04-10' })).toThrow()
    // Reopen then succeed
    reopenPeriodWithAudit()
    expect(() => applyPaymentToInvoice(inv.id, 50, { date: '2025-04-11', fundSource: 'cash' })).not.toThrow()
    expect(() => createBill({ number: 'B-PL-2', vendorId: ven.id, billDate: '2025-04-11', terms: 'Net 0', lines: [{ description: 'X', amount: 25 }] })).not.toThrow()
  })
})
