import { seedIfNeeded, db, createInvoice, updateInvoice, applyPaymentToInvoice, createCreditMemo } from '@/mock/db'
import { computeCustomerARSnapshot } from '@/mock/aggregations'

/**
 * Extended tests for enhanced Customer A/R Snapshot metrics (overdue, daysSinceLastPayment, riskLevel, credit utilization).
 */

describe('Customer AR Snapshot Extended Metrics', () => {
  beforeAll(()=> { seedIfNeeded() })

  test('overdue balance & risk escalation with high overdue ratio', () => {
    const cust = { id: `cust_snap_ext_${Date.now()}`, name: 'Risk Customer', creditLimit: 1000 }
    db.customers.push(cust as any)
    // Two invoices: one overdue, one current
    const past = createInvoice({ number: 'OLD-1', customerId: cust.id, date: '2025-01-01', lines: [{ description: 'Old', amount: 400 }] })
    updateInvoice(past.id, { status: 'sent' })
    const recent = createInvoice({ number: 'CUR-1', customerId: cust.id, date: '2025-03-10', lines: [{ description: 'Recent', amount: 200 }] })
    updateInvoice(recent.id, { status: 'sent' })
    // Partial payment on recent to set last payment closer
    const { payment } = applyPaymentToInvoice(recent.id, 50) as any
    if (payment) payment.date = '2025-03-15T00:00:00.000Z'
    const asOf = new Date('2025-04-01T00:00:00Z')
    const snap = computeCustomerARSnapshot(cust.id, asOf)
    // Overdue: past invoice full 400 is overdue; recent invoice balance 150 not overdue yet (due defaults Net 0/dueDate logic, treat invoice.date if no due?)
    expect(snap.overdueBalance).toBeGreaterThanOrEqual(400)
    expect(snap.openBalance).toBeCloseTo(400 + 150, 2)
    // Credit utilization: openBalance / creditLimit
    expect(snap.creditLimit).toBe(1000)
    expect(snap.creditUtilizationPct).toBeCloseTo(((snap.openBalance / 1000) * 100), 1)
    // Risk should be at least moderate (overdue ratio >= 400/openBalance > 0.5) => critical per heuristic
    expect(['critical','elevated']).toContain(snap.riskLevel)
  })

  test('daysSinceLastPayment null when no payments & low risk conditions', () => {
    const cust = { id: `cust_snap_ext_np_${Date.now()}`, name: 'NoPay Customer', creditLimit: 10000 }
    db.customers.push(cust as any)
    // Invoice dated very close to as-of so not overdue and utilization tiny relative to high credit limit
  const inv = createInvoice({ number: 'ONLY', customerId: cust.id, date: '2025-03-25', lines: [{ description: 'One', amount: 300 }] })
    updateInvoice(inv.id, { status: 'sent' })
    const asOf = new Date('2025-03-25T00:00:00Z')
    const snap = computeCustomerARSnapshot(cust.id, asOf)
    expect(snap.daysSinceLastPayment).toBeNull()
    // Overdue ratio 0, utilization 3%, daysSinceLastPayment null -> should remain low
    expect(snap.riskLevel).toBe('low')
  })

  test('credits reduce net receivable but utilization based on open balance', () => {
    const cust = { id: `cust_snap_ext_cr_${Date.now()}`, name: 'Credit Customer', creditLimit: 2000 }
    db.customers.push(cust as any)
    const inv = createInvoice({ number: 'CRED-1', customerId: cust.id, date: '2025-03-01', lines: [{ description: 'Work', amount: 800 }] })
    updateInvoice(inv.id, { status: 'sent' })
    createCreditMemo({ customerId: cust.id, date: '2025-03-05', lines: [{ description: 'Adj', amount: 200 }] })
    const asOf = new Date('2025-03-10T00:00:00Z')
    const snap = computeCustomerARSnapshot(cust.id, asOf)
    expect(snap.openBalance).toBeGreaterThanOrEqual(800)
    expect(snap.unappliedCredits).toBeGreaterThanOrEqual(200)
    expect(snap.netReceivable).toBeCloseTo(snap.openBalance - snap.unappliedCredits, 2)
    expect(snap.creditUtilizationPct).toBeCloseTo(((snap.openBalance / (snap.creditLimit || 1)) * 100), 1)
  })
})
