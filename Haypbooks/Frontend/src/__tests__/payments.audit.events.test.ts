import { mockApi } from '@/lib/mock-api'
import { setRoleOverride } from '@/lib/rbac'
import { seedIfNeeded, db, reopenPeriodWithAudit } from '@/mock/db'

async function post(path: string, body: any) {
  return mockApi<any>(path, { method: 'POST', body: JSON.stringify(body) })
}

describe('Audit events for payment-related actions', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {}; try { reopenPeriodWithAudit() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('customer payment creation logs customer-payment:create event (audit gated)', async () => {
    setRoleOverride('admin' as any)
    const cust = db.customers[0]
    // Create a small open invoice to allocate against
    const inv = db.invoices[0]
    const payment = await post('/api/customer-payments', { customerId: cust.id, amountReceived: 50, allocations: [{ invoiceId: inv.id, amount: 50 }], date: new Date().toISOString().slice(0,10) })
    expect(payment.customerPayment?.id).toBeTruthy()
    const cpId = payment.customerPayment.id
    // Without audit:read (viewer) attempting global audit list should fail
    setRoleOverride('viewer' as any)
    await expect(mockApi<any>('/api/audit')).rejects.toThrow(/403/i)
    // With admin, fetch audit and confirm event
    setRoleOverride('admin' as any)
    const audit = await mockApi<any>('/api/audit?action=customer-payment:create')
    const found = (audit.rows || audit.events || []).find((e: any) => e.entityId === cpId)
    expect(found).toBeTruthy()
  })

  test('invoice payment application logs invoice:payment event', async () => {
    setRoleOverride('admin' as any)
    // Ensure at least one invoice with balance
    const withBalance = db.invoices.find(i => i.balance > 0) || db.invoices[0]
    const amount = Math.min(10, withBalance.balance)
    const res = await post(`/api/invoices/${withBalance.id}/payments`, { amount })
    expect(res.payment?.id).toBeTruthy()
    const pId = res.payment.id
    const audit = await mockApi<any>('/api/audit?action=invoice:payment')
    const match = (audit.rows || []).find((e: any) => e.meta?.paymentId === pId || e.meta?.amount === amount)
    expect(match).toBeTruthy()
  })

  test('deposit creation logs deposit:create event', async () => {
    setRoleOverride('admin' as any)
    // Gather undeposited payments (simulate by applying a payment which should be undeposited if fundSource logic sets it)
    // For simplicity we will create two customer payments without allocating deposits first.
    const cust = db.customers[1]
    await post('/api/customer-payments', { customerId: cust.id, amountReceived: 25, allocations: [], date: new Date().toISOString().slice(0,10) })
    await post('/api/customer-payments', { customerId: cust.id, amountReceived: 30, allocations: [], date: new Date().toISOString().slice(0,10) })
    // Collect paymentIds from invoices (payments appended within invoices)
    const undeposited: string[] = []
    for (const inv of db.invoices) {
      for (const p of inv.payments) {
        if (p.fundSource === 'undeposited' && !p.depositId) undeposited.push(p.id)
      }
    }
    const pick = undeposited.slice(0, 2)
    expect(pick.length).toBeGreaterThan(0)
    const dep = await post('/api/deposits', { paymentIds: pick, date: new Date().toISOString().slice(0,10) })
    expect(dep.deposit?.id).toBeTruthy()
    const audit = await mockApi<any>('/api/audit?action=deposit:create')
    const found = (audit.rows || []).find((e: any) => e.entityId === dep.deposit.id)
    expect(found).toBeTruthy()
  })
})
