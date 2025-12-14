import { GET as GET_SUG } from '@/app/api/bank-feeds/match-suggestions/route'

function req(url: string) { return new Request(url) }

describe('Bank feeds: match suggestions API', () => {
  test('suggests an open invoice for a positive bank txn', async () => {
    const { db, createInvoice, applyPaymentToInvoice } = await import('@/mock/db')
    // Create a bank transaction of amount 250 inflow today
    const txnId = 'txn_match_1'
    ;(db.transactions as any[]).push({ id: txnId, date: new Date().toISOString(), amount: 250, description: 'ACME Payment', category: 'Income', accountId: db.accounts[0].id, bankStatus: 'for_review' })
    // Create an open invoice with total 250 due today
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-MATCH-1', customerId: cust.id, date: new Date().toISOString(), lines: [{ description: 'Services', amount: 250 }] })
    // Keep it unpaid (open)
    const res: any = await GET_SUG(req(`http://test/api/bank-feeds/match-suggestions?txnId=${txnId}&windowDays=30&amountTolerance=1`))
    expect(res.status).toBe(200)
    const j = await res.json()
    const candidates = j?.result?.candidates || []
    expect(Array.isArray(candidates)).toBe(true)
    const hit = candidates.find((c: any) => c.kind === 'invoice' && c.id === inv.id)
    expect(hit).toBeTruthy()
  })

  test('suggests an open bill for a negative bank txn', async () => {
    const { db, createBill } = await import('@/mock/db')
    const txnId = 'txn_match_2'
    ;(db.transactions as any[]).push({ id: txnId, date: new Date().toISOString(), amount: -180, description: 'Vendor Payment', category: 'Expense', accountId: db.accounts[0].id, bankStatus: 'for_review' })
    const ven = db.vendors[0]
    const bill = createBill({ number: 'BILL-MATCH-1', vendorId: ven.id, lines: [{ description: 'Parts', amount: 180 }] })
    const res: any = await GET_SUG(req(`http://test/api/bank-feeds/match-suggestions?txnId=${txnId}&windowDays=30&amountTolerance=1`))
    expect(res.status).toBe(200)
    const j = await res.json()
    const candidates = j?.result?.candidates || []
    const hit = candidates.find((c: any) => c.kind === 'bill' && c.id === bill.id)
    expect(hit).toBeTruthy()
  })
})
