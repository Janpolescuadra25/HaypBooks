import { seedIfNeeded, db, createInvoice, updateInvoice, applyPaymentToInvoice, createCreditMemo } from '@/mock/db'
import { computeCustomerStatement } from '@/mock/aggregations'

/**
 * Minimal tests validating customer statement running balance & aging reconciliation.
 */

describe('Customer Statement Computation', () => {
  beforeAll(() => { seedIfNeeded() })

  test('running balance reflects invoices, payments, credits in chronological order', () => {
  // Create isolated customer to avoid seed noise in statement
  const cust = { id: `cust_stmt1_${Date.now()}`, name: 'Stmt Customer 1' }
  db.customers.push(cust as any)
    // Create a new invoice sequence to isolate from seed noise
    const inv1 = createInvoice({ number: 'STMT-1', customerId: cust.id, date: '2025-02-01', lines: [{ description: 'A', amount: 100 }] })
    updateInvoice(inv1.id, { status: 'sent' })
    const inv2 = createInvoice({ number: 'STMT-2', customerId: cust.id, date: '2025-02-05', lines: [{ description: 'B', amount: 200 }] })
    updateInvoice(inv2.id, { status: 'sent' })
    // Apply partial payment to second invoice
  const { payment: pay } = applyPaymentToInvoice(inv2.id, 50) as any
  // Force payment date to be between inv2 and credit (2025-02-06) for deterministic ordering
  if (pay) pay.date = '2025-02-06T00:00:00.000Z'
    // Create credit memo
    createCreditMemo({ customerId: cust.id, date: '2025-02-07', lines: [{ description: 'Adj', amount: 30 }] })
    const asOf = new Date('2025-02-10T00:00:00Z')
    const stmt = computeCustomerStatement(cust.id, asOf)
    // Extract relevant lines we just created (filter by our invoice numbers or credit amount)
    const lines = stmt.lines.filter(l => {
      if (l.type === 'invoice') return ['STMT-1','STMT-2'].includes((l as any).number)
      if (l.type === 'payment') return (l as any).appliedToInvoiceNumber && ['STMT-1','STMT-2'].includes((l as any).appliedToInvoiceNumber)
      if (l.type === 'credit_memo') return true
      return false
    })
    const seq = lines.map(l => ({ type: l.type, impact: l.impact, running: l.runningBalance }))
    const invoice1 = seq.find(s => s.type === 'invoice' && s.impact === 100)
    const invoice2 = seq.find(s => s.type === 'invoice' && s.impact === 200)
  const payment = seq.find(s => s.type === 'payment')
    const credit = seq.find(s => s.type === 'credit_memo' && s.impact === -30)
    expect(invoice1).toBeTruthy()
    expect(invoice2).toBeTruthy()
    expect(payment).toBeTruthy()
    expect(credit).toBeTruthy()
    // Check running progression
    // After inv1: 100, after inv2: 300, after payment: 250, after credit: 220
    expect(invoice1!.running).toBe(100)
    expect(invoice2!.running).toBe(300)
  // Running after payment should be previous (300) - 50 = 250
  expect(payment!.running).toBe(250)
    expect(credit!.running).toBe(220)
  })

  test('aging totals align with outstanding invoice balances at asOf', () => {
  const cust = { id: `cust_stmt2_${Date.now()}`, name: 'Stmt Customer 2' }
  db.customers.push(cust as any)
  const invA = createInvoice({ number: 'STMT-A', customerId: cust.id, date: '2025-01-01', lines: [{ description: 'Old', amount: 150 }] })
    updateInvoice(invA.id, { status: 'sent' })
    const invB = createInvoice({ number: 'STMT-B', customerId: cust.id, date: '2025-02-15', lines: [{ description: 'Recent', amount: 90 }] })
    updateInvoice(invB.id, { status: 'sent' })
    // Pay part of invA
    applyPaymentToInvoice(invA.id, 50) // remaining 100
    const asOf = new Date('2025-03-15T00:00:00Z')
    const stmt = computeCustomerStatement(cust.id, asOf)
  // Compute expected open balance directly: invA remaining (100) + invB full (90)
  const expectedOpen = 100 + 90
  const agingTotal = stmt.aging.totals.total
  expect(Number(agingTotal.toFixed(2))).toBe(expectedOpen)
  })
})
