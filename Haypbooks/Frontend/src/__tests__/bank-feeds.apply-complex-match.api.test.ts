import { POST as APPLY_COMPLEX } from '@/app/api/bank-feeds/apply-complex-match/route'

function req(url: string, body: any) { return new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }) }

describe('Bank feeds: apply complex match API', () => {
  test('matches inflow against multiple invoices and an adjustment', async () => {
  const { db, createInvoice, seedIfNeeded } = await import('@/mock/db')
  seedIfNeeded()
    const today = new Date().toISOString()
    const txnId = 'txn_complex_inflow_1'
  ;(db.transactions as any[]).push({ id: txnId, date: today, amount: 505, description: 'Mixed receipt', category: 'Income', accountNumber: '1000', bankStatus: 'for_review' })
    const cust = db.customers[0]
    const inv1 = createInvoice({ number: 'INV-CX-1', customerId: cust.id, date: today, lines: [{ description: 'A', amount: 200 }] })
    const inv2 = createInvoice({ number: 'INV-CX-2', customerId: cust.id, date: today, lines: [{ description: 'B', amount: 250 }] })
    const res: any = await APPLY_COMPLEX(req('http://test/api/bank-feeds/apply-complex-match', {
      txnId,
      invoices: [{ id: inv1.id }, { id: inv2.id }],
      manualAdjustment: { accountNumber: '4000', amount: 55, memo: 'Discounts/fees net' },
      date: today.slice(0,10)
    }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j?.ok).toBe(true)
    const t = (db.transactions as any[]).find(t => t.id === txnId)
    expect(t?.bankStatus).toBe('categorized')
  })

  test('matches outflow against a bill and adjustment', async () => {
  const { db, createBill, seedIfNeeded } = await import('@/mock/db')
  seedIfNeeded()
    const today = new Date().toISOString()
    const txnId = 'txn_complex_outflow_1'
  ;(db.transactions as any[]).push({ id: txnId, date: today, amount: -310, description: 'Mixed payment', category: 'Expense', accountNumber: '1000', bankStatus: 'for_review' })
    const ven = db.vendors[0]
    const bill = createBill({ number: 'BILL-CX-1', vendorId: ven.id, lines: [{ description: 'Parts', amount: 280 }] })
    const res: any = await APPLY_COMPLEX(req('http://test/api/bank-feeds/apply-complex-match', {
      txnId,
      bills: [{ id: bill.id }],
  manualAdjustment: { accountNumber: '6050', amount: 30, memo: 'Bank fee' },
      date: today.slice(0,10)
    }))
    expect(res.status).toBe(200)
    const j = await res.json()
    expect(j?.ok).toBe(true)
    const t = (db.transactions as any[]).find(t => t.id === txnId)
    expect(t?.bankStatus).toBe('categorized')
  })
})
