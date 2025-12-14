import { GET as GET_SUG } from '@/app/api/bank-feeds/match-suggestions/route'
import { POST as APPLY } from '@/app/api/bank-feeds/apply-match/route'
import { POST as UNMATCH } from '@/app/api/bank-feeds/unmatch/route'

function req(url: string) { return new Request(url) }
function reqApply(body: any) { return new Request('http://test/api/bank-feeds/apply-match', { method: 'POST', body: JSON.stringify(body) }) }
function reqUnmatch(body: any) { return new Request('http://test/api/bank-feeds/unmatch', { method: 'POST', body: JSON.stringify(body) }) }

describe('Bank feeds: deposit suggestions and apply/unmatch', () => {
  test('suggests and applies a deposit match', async () => {
    const { db, createInvoice, createDeposit, applyPaymentToInvoice } = await import('@/mock/db')
    // Create an invoice and payment to seed a deposit
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-DEP-1', customerId: cust.id, date: new Date().toISOString(), lines: [{ description: 'Service', amount: 150 }] })
    // Apply a payment to create a payment entry in undeposited, then deposit it
    applyPaymentToInvoice(inv.id, 150, { fundSource: 'undeposited' })
    const payId = inv.payments[0]?.id
    expect(payId).toBeTruthy()
    const dep = createDeposit({ paymentIds: [payId!] })
    expect(dep.total).toBe(150)
    // Bank txn inflow of same total
    const txnId = 'txn_dep_sug_1'
    ;(db.transactions as any[]).push({ id: txnId, date: new Date().toISOString(), amount: 150, description: 'Banked deposit', category: 'Income', accountId: db.accounts[0].id, bankStatus: 'for_review' })
    const resSug: any = await GET_SUG(req(`http://test/api/bank-feeds/match-suggestions?txnId=${txnId}&windowDays=30&amountTolerance=1`))
    expect(resSug.status).toBe(200)
    const j = await resSug.json()
    const cand = (j?.result?.candidates || []).find((c:any) => c.kind === 'deposit' && c.id === dep.id)
    expect(cand).toBeTruthy()
    const resApply: any = await APPLY(reqApply({ txnId, kind: 'deposit', id: dep.id }))
    expect(resApply.status).toBe(200)
    const t = (db.transactions as any[]).find(tt => tt.id === txnId)
    expect(t?.bankStatus).toBe('categorized')
    expect(t?.matchedKind).toBe('deposit')
    const resUnmatch: any = await UNMATCH(reqUnmatch({ txnId }))
    expect(resUnmatch.status).toBe(200)
    const t2 = (db.transactions as any[]).find(tt => tt.id === txnId)
    expect(t2?.bankStatus).toBe('for_review')
    expect(t2?.matchedKind).toBeUndefined()
  })
})
