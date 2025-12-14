import { POST as POST_APPLY } from '@/app/api/bank-feeds/apply-match/route'

function req(body: any) {
  return new Request('http://test/api/bank-feeds/apply-match', { method: 'POST', body: JSON.stringify(body) })
}

describe('Bank feeds: apply match API', () => {
  test('applies a match to an invoice and categorizes the bank txn', async () => {
    const { db, createInvoice } = await import('@/mock/db')
    // Seed bank txn inflow
    const txnId = 'txn_apply_1'
    ;(db.transactions as any[]).push({ id: txnId, date: new Date().toISOString(), amount: 300, description: 'Customer payment', category: 'Income', accountId: db.accounts[0].id, bankStatus: 'for_review' })
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-APPLY-1', customerId: cust.id, date: new Date().toISOString(), lines: [{ description: 'Service', amount: 300 }] })
    const res: any = await POST_APPLY(req({ txnId, kind: 'invoice', id: inv.id }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j?.ok).toBe(true)
    const updated = (db.transactions as any[]).find(t => t.id === txnId)
    expect(updated?.bankStatus).toBe('categorized')
    expect(updated?.matchedKind).toBe('invoice')
    expect(updated?.matchedId).toBe(inv.id)
  })

  test('applies a match to a bill and categorizes the bank txn', async () => {
    const { db, createBill } = await import('@/mock/db')
    const txnId = 'txn_apply_2'
    ;(db.transactions as any[]).push({ id: txnId, date: new Date().toISOString(), amount: -180, description: 'Vendor payment cleared', category: 'Expense', accountId: db.accounts[0].id, bankStatus: 'for_review' })
    const ven = db.vendors[0]
    const bill = createBill({ number: 'BILL-APPLY-1', vendorId: ven.id, lines: [{ description: 'Parts', amount: 180 }] })
    const res: any = await POST_APPLY(req({ txnId, kind: 'bill', id: bill.id }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j?.ok).toBe(true)
    const updated = (db.transactions as any[]).find(t => t.id === txnId)
    expect(updated?.bankStatus).toBe('categorized')
    expect(updated?.matchedKind).toBe('bill')
    expect(updated?.matchedId).toBe(bill.id)
  })
})
