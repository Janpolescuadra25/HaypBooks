import { mockApi } from '@/lib/mock-api'
import { db, seedIfNeeded, closePeriod, reopenPeriodWithAudit } from '@/mock/db'

async function createBill(total = 125) {
  const amount = typeof total === 'number' ? total : 125
  const body = { vendorId: db.vendors[0]?.id || 'Vendor 1', items: [{ description: 'Line', amount }], dueDate: new Date().toISOString() }
  const res = await mockApi<any>('http://localhost/api/bills', { method: 'POST', body: JSON.stringify(body) })
  return res.bill
}

function today() { return new Date().toISOString().slice(0,10) }

describe('Pay Bills → Checks (print later)', () => {
  beforeEach(() => {
    ;(db as any).seeded = false
    db.accounts.length = 0
    db.transactions.length = 0
    db.invoices.length = 0
    db.bills.length = 0
    db.auditEvents.length = 0
    db.vendors.length = 0
    seedIfNeeded()
  })

  test('creating payment with method check and printLater queues a to_print check with numbering', async () => {
    const bill = await createBill(125)
    const body = { amount: bill.total, date: today(), method: 'check', printLater: true, checkAccount: 'Operating Checking - 1234', reference: 'PB-001' }
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify(body) })
    expect(res.payment).toBeTruthy()
    // The checks store is internal; assert via audit trail
    const audit = (db.auditEvents || []).filter(e => e.entityType === 'check' && e.action === 'check:create').slice(-1)[0]
    expect(audit).toBeTruthy()
    expect(audit.meta?.source).toBe('billPayment')
    expect(audit.meta?.billId).toBe(bill.id)
    expect(audit.meta?.account).toBe('Operating Checking - 1234')
    expect(Number(audit.after?.amount)).toBeCloseTo(bill.total)
    expect(audit.after?.status).toBe('to_print')
    expect(String(audit.after?.number || '')).not.toHaveLength(0)
  })

  test('payment date enforces closed period (blocked then succeeds after reopen)', async () => {
    const bill = await createBill(50)
    const yday = new Date(Date.now() - 24*3600*1000).toISOString().slice(0,10)
    closePeriod(yday)
    // Attempt to pay with date in closed period
    await expect(async () => {
      await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: bill.total, date: yday, method: 'check', printLater: true, checkAccount: 'Operating Checking - 1234' }) })
    }).rejects.toThrow(/closed period|400/i)
    reopenPeriodWithAudit()
    const ok = await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: bill.total, date: today(), method: 'check', printLater: true, checkAccount: 'Operating Checking - 1234' }) })
    expect(ok.payment).toBeTruthy()
  })
})
