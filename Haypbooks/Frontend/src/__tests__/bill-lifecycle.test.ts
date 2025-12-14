import { seedIfNeeded, createBill, applyPaymentToBill, billApprovalAction, db } from '../mock/db'
import { computeTrialBalance } from '../mock/aggregations'
import { assertBalanced } from '../test-utils/assertBalanced'

describe('Bill lifecycle & approval', () => {
  beforeAll(() => { seedIfNeeded() })
  test('open -> pending_approval -> approved -> paid; trial balance remains balanced', () => {
    const bill = createBill({ vendorId: db.vendors[0].id, dueDate: new Date().toISOString(), lines: [ { description: 'Svc', amount: 300 } ] })
    expect(bill.status).toBe('open')
    billApprovalAction(bill.id, 'submit')
    expect(db.bills.find(b=>b.id===bill.id)!.status).toBe('pending_approval')
    billApprovalAction(bill.id, 'approve')
    expect(db.bills.find(b=>b.id===bill.id)!.status).toBe('approved')
    applyPaymentToBill(bill.id, 300)
    expect(db.bills.find(b=>b.id===bill.id)!.status).toBe('paid')
    const tb = computeTrialBalance({})
    expect(tb.balanced).toBe(true)
    assertBalanced('bill lifecycle approval flow')
  })
})
