import { seedIfNeeded, db, createInvoice, updateInvoice, applyPaymentToInvoice, createCreditMemo } from '@/mock/db'
import { computeCustomerARSnapshot } from '@/mock/aggregations'

/**
 * Tests for Customer A/R Snapshot aggregation.
 */

describe('Customer AR Snapshot', () => {
  beforeAll(()=> { seedIfNeeded() })

  test('open balance - credits => net receivable; last payment date captured', () => {
    const cust = { id: `cust_snap_${Date.now()}`, name: 'Snapshot Customer' }
    db.customers.push(cust as any)
    // Invoices
    const inv1 = createInvoice({ number: 'SNAP-1', customerId: cust.id, date: '2025-03-01', dueDate: '2025-03-15', lines: [{ description: 'Work', amount: 300 }] })
    updateInvoice(inv1.id, { status: 'sent' })
    const inv2 = createInvoice({ number: 'SNAP-2', customerId: cust.id, date: '2025-03-10', dueDate: '2025-03-20', lines: [{ description: 'Extra', amount: 200 }] })
    updateInvoice(inv2.id, { status: 'sent' })
    // Payments: partial on inv1 (100) dated 2025-03-12
    const { payment: p1 } = applyPaymentToInvoice(inv1.id, 100) as any
    if (p1) p1.date = '2025-03-12T00:00:00.000Z'
    // Credit memo 50 on 2025-03-13
    createCreditMemo({ customerId: cust.id, date: '2025-03-13', lines: [{ description: 'Adj', amount: 50 }] })
    const asOf = new Date('2025-03-16T00:00:00Z')
    const snap = computeCustomerARSnapshot(cust.id, asOf)
    // Open balances: inv1 remaining 200, inv2 full 200 => 400
    expect(snap.openBalance).toBe(400)
    // Unapplied credits 50 => net 350
    expect(snap.unappliedCredits).toBe(50)
    expect(snap.netReceivable).toBe(350)
    expect(snap.openInvoices).toBe(2)
    expect(snap.lastPaymentDate).toBe('2025-03-12')
    expect(snap.nextDueDate).toBe('2025-03-15')
  })

  test('future-dated invoices ignored until asOf', () => {
    const cust = { id: `cust_snap_future_${Date.now()}`, name: 'Snapshot Future Customer' }
    db.customers.push(cust as any)
    const inv = createInvoice({ number: 'SNAP-FUT', customerId: cust.id, date: '2025-04-01', lines: [{ description: 'Future', amount: 120 }] })
    updateInvoice(inv.id, { status: 'sent' })
    const asOf = new Date('2025-03-20T00:00:00Z')
    const snap = computeCustomerARSnapshot(cust.id, asOf)
    expect(snap.openBalance).toBe(0)
    expect(snap.openInvoices).toBe(0)
  })
})
