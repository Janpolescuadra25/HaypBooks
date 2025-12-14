import { seedIfNeeded, createInvoice, voidInvoice, createBill, voidBill, db } from '@/mock/db'
import { assertBalanced } from '../test-utils/assertBalanced'

describe('Void Workflows', () => {
  beforeAll(() => { seedIfNeeded() })

  test('void unpaid invoice with reversing entry + reason + reversalDate', () => {
    const inv = createInvoice({ number: 'VOID-INV-1', customerId: db.customers[0].id, date: '2025-02-10', lines: [ { description: 'Svc', amount: 300 } ] })
    // Move to sent so that posting occurs under accrual
    inv.status = 'sent'
    // Trigger posting
    // Ensure posting logic applied if accrual; accessing invoice triggers nothing directly but kept for parity
    if (db.settings?.accountingMethod === 'accrual') {
      void db.invoices.find(i => i.id === inv.id)
    }
    const priorAuditCount = (db.auditEvents || []).length
  const reason = 'Entered in error'
  const reversalDate = '2025-02-15'
  voidInvoice(inv.id, { createReversing: true, reason, reversalDate })
    const updated = db.invoices.find(i => i.id === inv.id)
    expect(updated?.status).toBe('void')
    expect(updated?.balance).toBe(0)
    const newAudit = (db.auditEvents || []).slice(priorAuditCount)
    const voidEvent = newAudit.find(e => e.action === 'void' && e.entityType === 'invoice')
    expect(voidEvent).toBeTruthy()
    expect(voidEvent?.meta?.reason).toBe(reason)
    expect(voidEvent?.meta?.reversalDate).toBe(reversalDate)
  assertBalanced('void invoice')
  })

  test('cannot void invoice with payments', () => {
    const inv = createInvoice({ number: 'VOID-INV-2', customerId: db.customers[0].id, date: '2025-02-11', lines: [ { description: 'Svc', amount: 100 } ] })
    inv.payments.push({ id: 'p-temp', date: '2025-02-11', amount: 50, appliedToType: 'invoice', appliedToId: inv.id })
    expect(() => voidInvoice(inv.id)).toThrow(/payments/i)
  })

  test('void unpaid bill with reversing entry + reason + reversalDate', () => {
    const bill = createBill({ vendorId: db.vendors[0].id, dueDate: '2025-02-12', lines: [ { description: 'Mat', amount: 200 } ] })
    const priorAudit = (db.auditEvents || []).length
  const reason = 'Duplicate'
  const reversalDate = '2025-02-16'
  voidBill(bill.id, { createReversing: true, reason, reversalDate })
    const updated = db.bills.find(b => b.id === bill.id)
    expect(updated?.status).toBe('void')
    expect(updated?.balance).toBe(0)
    const newAudit = (db.auditEvents || []).slice(priorAudit)
    const voidEvent = newAudit.find(e => e.action === 'void' && e.entityType === 'bill')
    expect(voidEvent).toBeTruthy()
    expect(voidEvent?.meta?.reason).toBe(reason)
    expect(voidEvent?.meta?.reversalDate).toBe(reversalDate)
  assertBalanced('void bill')
  })

  test('cannot void bill with payments', () => {
    const bill = createBill({ vendorId: db.vendors[0].id, dueDate: '2025-02-13', lines: [ { description: 'Mat', amount: 120 } ] })
    bill.payments.push({ id: 'p-temp2', date: '2025-02-13', amount: 60, appliedToType: 'bill', appliedToId: bill.id })
    expect(() => voidBill(bill.id)).toThrow(/payments/i)
  })
})
