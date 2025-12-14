import { db } from '@/mock/db'
import { mockApi } from '@/lib/mock-api'
import { POST as CP_POST } from '@/app/api/customer-payments/route'
import { POST as CP_VOID } from '@/app/api/customer-payments/[id]/void/route'
import { GET as UNDEP_GET } from '@/app/api/undeposited-payments/route'

const makeReq = (url: string, method: string, body?: any) => new Request(url, { method, body: body ? JSON.stringify(body) : undefined })

async function seedInvoice(total = 180, date = '2025-03-12') {
  // seed via any GET call
  await mockApi<any>('http://localhost/api/customers', { method: 'GET' })
  const custId = db.customers[0]?.id || 'cust_1'
  const res = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify({ customerId: custId, number: `INV-DB-${Math.floor(Math.random()*10000)}`, date, lines: [{ description: 'Line', amount: total }] }) })
  await mockApi<any>(`http://localhost/api/invoices/${res.invoice.id}`, { method: 'PUT', body: JSON.stringify({ status: 'sent' }) })
  return { invoice: res.invoice, customerId: custId }
}

describe('Customer Payments — direct to bank (skip Undeposited)', () => {
  beforeEach(() => {
    ;(db as any).seeded = false
    db.accounts.length = 0
    db.transactions.length = 0
    db.invoices.length = 0
    if (db.estimates) db.estimates.length = 0
    db.bills.length = 0
    db.customers.length = 0
    db.vendors.length = 0
    db.items.length = 0
    if (db.journalEntries) db.journalEntries.length = 0
    if (db.auditEvents) db.auditEvents.length = 0
    db.customerPayments = []
    db.deposits = []
  })

  test('posts DR to selected Asset account (1000) and does not appear in Undeposited list', async () => {
    const { invoice, customerId } = await seedInvoice(150, '2025-03-13')
    // Choose Cash account 1000 to simulate electronic payment deposited directly
    const amount = 60
    const res: any = await CP_POST(makeReq('http://local/api/customer-payments', 'POST', { customerId, amountReceived: amount, date: '2025-03-14', allocations: [{ invoiceId: invoice.id, amount }], depositAccountNumber: '1000' }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    const cp = body.customerPayment
    expect(cp).toBeTruthy()
    // Should NOT appear in undeposited payments list
    const undepRes: any = await UNDEP_GET()
    const undepBody = await undepRes.json()
    const found = undepBody.payments.find((p: any) => p.invoiceId === invoice.id && Number(p.amount) === amount)
    expect(found).toBeFalsy()
    // Validate fundSource and journal debit account
    const payId: string = cp.paymentIds[0]
    // Find the invoice payment object
    const inv = (db.invoices || []).find(i => i.id === invoice.id)!
    const pay = inv.payments.find(p => p.id === payId)!
    expect(pay.fundSource).toBe('cash')
    expect(pay.depositId).toBeUndefined()
    // Journal entry should debit 1000 and credit AR (1100) under accrual (default mock setting)
    const je = (db.journalEntries || []).find(j => j.linkedType === 'payment' && j.linkedId === payId)!
    expect(je).toBeTruthy()
    const cashAcc = db.accounts.find((a: any) => a.number === '1000')!
    const arAcc = db.accounts.find((a: any) => a.number === '1100')!
    const dr = je.lines.find((l: any) => l.accountId === cashAcc.id)
    const cr = je.lines.find((l: any) => l.accountId === arAcc.id)
    expect(Number(dr?.debit || 0)).toBeCloseTo(amount, 5)
    expect(Number(cr?.credit || 0)).toBeCloseTo(amount, 5)
  })

  test('voiding a direct-to-bank receipt is allowed and restores balance', async () => {
    const { invoice, customerId } = await seedInvoice(120, '2025-03-15')
    const amount = 70
    const post: any = await CP_POST(makeReq('http://local/api/customer-payments', 'POST', { customerId, amountReceived: amount, date: '2025-03-16', allocations: [{ invoiceId: invoice.id, amount }], depositAccountNumber: '1000' }) as any)
    expect(post.status).toBe(200)
    const cp = (await post.json()).customerPayment
    const beforeCount = (db.journalEntries || []).length
    const voidRes: any = await CP_VOID(makeReq(`http://local/api/customer-payments/${cp.id}/void`, 'POST', { reversalDate: '2025-03-17' }) as any, { params: { id: cp.id } } as any)
    expect(voidRes.status).toBe(200)
    // Balance restored
    const inv = (db.invoices || []).find(i => i.id === invoice.id)!
    expect(Number(inv.balance)).toBeCloseTo(inv.total, 5)
    // Reversing journal added
    const afterCount = (db.journalEntries || []).length
    expect(afterCount).toBeGreaterThan(beforeCount)
  })
})
