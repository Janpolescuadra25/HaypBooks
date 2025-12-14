import { seedIfNeeded, createInvoice, applyPaymentToInvoice, updateInvoice, db } from '../mock/db'
import { computeTrialBalance } from '../mock/aggregations'
import { assertBalanced } from '../test-utils/assertBalanced'

describe('Invoice lifecycle', () => {
  beforeAll(() => { seedIfNeeded() })
  test('draft -> sent -> partial -> paid with balanced trial balance', () => {
    const inv = createInvoice({ number: 'INV-T1', customerId: db.customers[0].id, date: new Date().toISOString(), lines: [ { description: 'Line', amount: 500 } ] })
    expect(inv.status).toBe('draft')
    // Transition to sent via update (simulate send action)
    updateInvoice(inv.id, { status: 'sent' })
    const afterSend = db.invoices.find(i => i.id === inv.id)!
  expect(['sent','partial','paid','overdue']).toContain(afterSend.status)
    // Partial payment
    applyPaymentToInvoice(inv.id, 200)
    const afterPartial = db.invoices.find(i => i.id === inv.id)!
  expect(['partial','overdue']).toContain(afterPartial.status)
    expect(afterPartial.balance).toBe(300)
    // Final payment
    applyPaymentToInvoice(inv.id, 300)
    const final = db.invoices.find(i => i.id === inv.id)!
    expect(final.status).toBe('paid')
    expect(final.balance).toBe(0)
    const tb = computeTrialBalance({})
    expect(tb.balanced).toBe(true)
    assertBalanced('invoice lifecycle')
  })
})
