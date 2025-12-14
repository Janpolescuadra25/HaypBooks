import { seedIfNeeded, createInvoice, applyPaymentToInvoice, createBill, applyPaymentToBill, createAdjustingJournal, voidInvoice, voidBill, db } from '@/mock/db'
import { assertBalanced } from '../test-utils/assertBalanced'

/**
 * Ledger Balance Stress Test
 * Chained realistic mutations across invoices, bills, adjustments, and voids.
 * Ensures the ledger remains balanced after each mutation category.
 */

describe('Ledger balance stress sequence', () => {
  beforeAll(() => { seedIfNeeded() })

  test('sequence of mixed operations preserves balance', () => {
    assertBalanced('initial seed')

    // 1. Create and fully pay an invoice in two parts
    const inv = createInvoice({ number: 'STRESS-INV-1', customerId: db.customers[0].id, date: new Date().toISOString(), lines: [ { description: 'Consulting', amount: 750 } ] })
    inv.status = 'sent'
    assertBalanced('after invoice create')
    applyPaymentToInvoice(inv.id, 300)
    assertBalanced('after partial invoice payment')
    applyPaymentToInvoice(inv.id, 450)
    assertBalanced('after full invoice payment')

    // 2. Create a bill and partially pay, then schedule remainder (if schedule concept exists indirectly)
    const bill = createBill({ vendorId: db.vendors[0].id, dueDate: new Date().toISOString(), lines: [ { description: 'Supplies', amount: 420 } ] })
    assertBalanced('after bill create')
    applyPaymentToBill(bill.id, 200)
    assertBalanced('after partial bill payment')
    applyPaymentToBill(bill.id, 220)
    assertBalanced('after full bill payment')

    // 3. Create an adjusting journal entry (e.g., accrual or reclass) with reversing flag
  createAdjustingJournal({ date: new Date().toISOString().slice(0,10), lines: [ { accountNumber: db.accounts[0].number, debit: 500 }, { accountNumber: db.accounts[1].number, credit: 500 } ], reversing: true })
    assertBalanced('after adjusting + reversing setup')

    // 4. Void a new small unpaid invoice with reversing entry
    const inv2 = createInvoice({ number: 'STRESS-INV-VOID', customerId: db.customers[0].id, date: new Date().toISOString(), lines: [ { description: 'Temp', amount: 150 } ] })
    inv2.status = 'sent'
    voidInvoice(inv2.id, { createReversing: true })
    assertBalanced('after void invoice with reversal')

    // 5. Void a new unpaid bill with reversing entry
    const bill2 = createBill({ vendorId: db.vendors[0].id, dueDate: new Date().toISOString(), lines: [ { description: 'Temp Supplies', amount: 180 } ] })
    voidBill(bill2.id, { createReversing: true })
    assertBalanced('after void bill with reversal')
  })
})
