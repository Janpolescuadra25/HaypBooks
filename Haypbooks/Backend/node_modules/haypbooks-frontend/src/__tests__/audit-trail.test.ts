import { seedIfNeeded, createInvoice, updateInvoice, applyPaymentToInvoice, createAdjustingJournal, closePeriod, db } from '@/mock/db'

// Utility to count events by action
function count(action: string) {
  return (db.auditEvents || []).filter(e => e.action === action).length
}

describe('Audit Trail', () => {
  beforeAll(() => {
    seedIfNeeded()
  })

  test('records create/update/payment and adjusting journal and close-period events', () => {
    const c0 = (db.auditEvents || []).length
    const createBefore = count('create')
    const adjBefore = count('adjusting-journal')
    const closeBefore = count('close-period')

    const inv = createInvoice({ number: 'INV-T-AUD', customerId: db.customers[0].id, date: '2025-02-01', lines: [ { description: 'Line', amount: 100 } ] })
    updateInvoice(inv.id, { status: 'sent' })
    applyPaymentToInvoice(inv.id, 50)
    createAdjustingJournal({ date: '2025-02-02', lines: [ { accountNumber: '6000', debit: 200 }, { accountNumber: '2000', credit: 200 } ], reversing: false })
    closePeriod('2025-01-31')

    const c1 = (db.auditEvents || []).length
    expect(c1).toBeGreaterThan(c0)
    expect(count('create')).toBeGreaterThan(createBefore)
    expect(count('adjusting-journal')).toBeGreaterThan(adjBefore)
    expect(count('close-period')).toBeGreaterThan(closeBefore)

    const paymentEvents = (db.auditEvents || []).filter(e => e.action === 'apply-payment' && e.entityType === 'invoice' && e.entityId === inv.id)
    expect(paymentEvents.length).toBeGreaterThan(0)

    // Validate the create event for the invoice captured correct entityType
    const invoiceCreate = (db.auditEvents || []).find(e => e.action === 'create' && e.entityType === 'invoice' && e.entityId === inv.id)
    expect(invoiceCreate).toBeTruthy()

    // Validate adjusting journal event structure
    const adjEvent = (db.auditEvents || []).find(e => e.action === 'adjusting-journal' && e.entityType === 'journal')
    expect(adjEvent && adjEvent.after && Array.isArray((adjEvent.after as any).lines)).toBe(true)
  })
})
