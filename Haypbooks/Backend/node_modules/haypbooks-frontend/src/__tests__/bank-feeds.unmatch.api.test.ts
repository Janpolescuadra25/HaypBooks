import { POST as APPLY } from '@/app/api/bank-feeds/apply-match/route'
import { POST as UNMATCH } from '@/app/api/bank-feeds/unmatch/route'

function reqApply(body: any) { return new Request('http://test/api/bank-feeds/apply-match', { method: 'POST', body: JSON.stringify(body) }) }
function reqUnmatch(body: any) { return new Request('http://test/api/bank-feeds/unmatch', { method: 'POST', body: JSON.stringify(body) }) }

describe('Bank feeds: unmatch API', () => {
  test('unmatches an applied invoice payment and restores bank txn', async () => {
    const { db, createInvoice } = await import('@/mock/db')
    const txnId = 'txn_unmatch_1'
    ;(db.transactions as any[]).push({ id: txnId, date: new Date().toISOString(), amount: 125, description: 'Cust pmt', category: 'Income', accountId: db.accounts[0].id, bankStatus: 'for_review' })
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-UNMATCH-1', customerId: cust.id, date: new Date().toISOString(), lines: [{ description: 'Svc', amount: 125 }] })
    const resApply: any = await APPLY(reqApply({ txnId, kind: 'invoice', id: inv.id }))
    expect(resApply.status).toBe(200)
    const resUnmatch: any = await UNMATCH(reqUnmatch({ txnId }))
    expect(resUnmatch.status).toBe(200)
    const j = await resUnmatch.json()
    expect(j?.ok).toBe(true)
    const t = (db.transactions as any[]).find(tt => tt.id === txnId)
    expect(t?.bankStatus).toBe('for_review')
    expect(t?.matchedKind).toBeUndefined()
  })

  test('blocks unmatch when payment is deposited', async () => {
    const { db, createInvoice, createDeposit } = await import('@/mock/db')
    const txnId = 'txn_unmatch_2'
    ;(db.transactions as any[]).push({ id: txnId, date: new Date().toISOString(), amount: 200, description: 'Cust pmt', category: 'Income', accountId: db.accounts[0].id, bankStatus: 'for_review' })
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-UNMATCH-2', customerId: cust.id, date: new Date().toISOString(), lines: [{ description: 'Svc', amount: 200 }] })
    const resApply: any = await APPLY(reqApply({ txnId, kind: 'invoice', id: inv.id }))
    expect(resApply.status).toBe(200)
    // Find the payment and create a deposit batch
    const invObj = db.invoices.find((x:any) => x.id === inv.id)
    const payId = invObj?.payments[0]?.id
    expect(payId).toBeTruthy()
    if (payId) { createDeposit({ paymentIds: [payId] }) }
    const resUnmatch: any = await UNMATCH(reqUnmatch({ txnId }))
    expect(resUnmatch.status).toBe(400)
    const j = await resUnmatch.json().catch(()=>null)
    expect((j?.error || '').toLowerCase()).toContain('cannot unmatch')
  })
})
