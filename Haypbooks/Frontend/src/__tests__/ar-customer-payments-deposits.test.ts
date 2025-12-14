import { seedIfNeeded, db, createInvoice, updateInvoice, createCustomerPayment, createDeposit } from '@/mock/db'

/**
 * Tests for multi-invoice customer payment allocation, unapplied credit behavior, and deposit batching.
 * Focus: domain logic only (mock db layer) – aligns with new payment & deposit workflow.
 */

describe('A/R Customer Payments & Deposits', () => {
  beforeEach(() => {
    // Re-seed a fresh environment (simple reset pattern for mock db)
    // NOTE: db does not expose a reset, so for isolation we rely on first-run seed + creating unique artifacts.
    if (!db.seeded) seedIfNeeded()
  })

  test('rejects allocation that exceeds invoice balance', () => {
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-AR-OVER', customerId: cust.id, date: '2025-03-01', lines: [ { description: 'Service', amount: 100 } ] })
    updateInvoice(inv.id, { status: 'sent' })
    expect(() => createCustomerPayment({ customerId: cust.id, amountReceived: 150, allocations: [ { invoiceId: inv.id, amount: 120 } ] })).toThrow(/exceeds invoice balance/i)
  })

  test('creates unapplied credit when remainder exists and autoCreditUnapplied=true', () => {
    const cust = db.customers[1]
    const inv = createInvoice({ number: 'INV-AR-CRED', customerId: cust.id, date: '2025-03-02', lines: [ { description: 'Service', amount: 100 } ] })
    updateInvoice(inv.id, { status: 'sent' })
    const cp = createCustomerPayment({ customerId: cust.id, amountReceived: 150, allocations: [ { invoiceId: inv.id, amount: 100 } ], autoCreditUnapplied: true })
    expect(cp.amountAllocated).toBe(100)
    expect(cp.amountUnapplied).toBe(50)
    // A credit memo should have been created for the remainder
    const credit = (db as any).creditMemos.find((cm: any) => cm.customerId === cust.id && cm.total === 50)
    expect(credit).toBeTruthy()
  })

  test('customer payment status transitions based on allocation coverage', () => {
    const cust = db.customers[2]
    // Partial allocation invoice
    const invPartial = createInvoice({ number: 'INV-AR-STAT-PART', customerId: cust.id, date: '2025-03-03', lines: [ { description: 'Service', amount: 200 } ] })
    updateInvoice(invPartial.id, { status: 'sent' })
    const cpPartial = createCustomerPayment({ customerId: cust.id, amountReceived: 200, allocations: [ { invoiceId: invPartial.id, amount: 150 } ] })
    expect(cpPartial.status).toBe('partial')
    // Full allocation on separate invoice to avoid leftover balance side-effects
    const invFull = createInvoice({ number: 'INV-AR-STAT-FULL', customerId: cust.id, date: '2025-03-03', lines: [ { description: 'Service', amount: 200 } ] })
    updateInvoice(invFull.id, { status: 'sent' })
    const cpFull = createCustomerPayment({ customerId: cust.id, amountReceived: 200, allocations: [ { invoiceId: invFull.id, amount: 200 } ] })
    expect(cpFull.status).toBe('fully_applied')
    const cpUnapplied = createCustomerPayment({ customerId: cust.id, amountReceived: 75, allocations: [] })
    expect(cpUnapplied.status).toBe('unapplied')
  })

  test('deposit batching sets depositId and moves undeposited payments to cash', () => {
    const cust = db.customers[3]
    const inv1 = createInvoice({ number: 'INV-AR-DEP1', customerId: cust.id, date: '2025-03-04', lines: [ { description: 'Service', amount: 120 } ] })
    updateInvoice(inv1.id, { status: 'sent' })
    const inv2 = createInvoice({ number: 'INV-AR-DEP2', customerId: cust.id, date: '2025-03-04', lines: [ { description: 'Service', amount: 80 } ] })
    updateInvoice(inv2.id, { status: 'sent' })
    const cp = createCustomerPayment({ customerId: cust.id, amountReceived: 200, allocations: [ { invoiceId: inv1.id, amount: 120 }, { invoiceId: inv2.id, amount: 80 } ] })
    // Gather the underlying invoice payment IDs (stored on cp)
    expect(cp.paymentIds.length).toBe(2)
    const dep = createDeposit({ paymentIds: cp.paymentIds })
    expect(dep.total).toBe(200)
    // Each payment should now have depositId & fundSource transitioned to cash
    for (const invoice of db.invoices) {
      for (const p of invoice.payments) {
        if (cp.paymentIds.includes(p.id)) {
          expect(p.depositId).toBe(dep.id)
          expect(p.fundSource).toBe('cash')
        }
      }
    }
  })

  test('prevent depositing same payment twice', () => {
    const cust = db.customers[4]
    const inv = createInvoice({ number: 'INV-AR-DEP3', customerId: cust.id, date: '2025-03-05', lines: [ { description: 'Service', amount: 90 } ] })
    updateInvoice(inv.id, { status: 'sent' })
    const cp = createCustomerPayment({ customerId: cust.id, amountReceived: 90, allocations: [ { invoiceId: inv.id, amount: 90 } ] })
    const first = createDeposit({ paymentIds: cp.paymentIds })
    expect(first.total).toBe(90)
    expect(() => createDeposit({ paymentIds: cp.paymentIds })).toThrow(/already deposited/i)
  })
})
