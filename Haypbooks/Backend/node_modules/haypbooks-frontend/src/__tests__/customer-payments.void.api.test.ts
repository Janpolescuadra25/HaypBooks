import { db } from '@/mock/db'
import { mockApi } from '@/lib/mock-api'
import { POST as CP_POST } from '@/app/api/customer-payments/route'
import { POST as CP_VOID } from '@/app/api/customer-payments/[id]/void/route'
import { GET as UNDEP_GET } from '@/app/api/undeposited-payments/route'
import { POST as DEPOSITS_POST } from '@/app/api/deposits/route'

const makeReq = (url: string, method: string, body?: any) => new Request(url, { method, body: body ? JSON.stringify(body) : undefined })

async function seedInvoice(total = 200, date = '2025-03-08') {
  await mockApi<any>('http://localhost/api/customers', { method: 'GET' })
  const custId = db.customers[0]?.id || 'cust_1'
  const res = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify({ customerId: custId, number: `INV-VOID-${Math.floor(Math.random()*10000)}`, date, lines: [{ description: 'Line', amount: total }] }) })
  await mockApi<any>(`http://localhost/api/invoices/${res.invoice.id}`, { method: 'PUT', body: JSON.stringify({ status: 'sent' }) })
  return { invoice: res.invoice, customerId: custId }
}

describe('Customer Payments void workflow', () => {
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

  test('void restores invoice balance and posts reversing journals', async () => {
    const { invoice, customerId } = await seedInvoice(200)
    // create payment 80 to 1010
    const payRes: any = await CP_POST(makeReq('http://local/api/customer-payments', 'POST', { customerId, amountReceived: 80, date: '2025-03-09', allocations: [{ invoiceId: invoice.id, amount: 80 }], depositAccountNumber: '1010' }) as any)
    expect(payRes.status).toBe(200)
    const payBody = await payRes.json()
    const cp = payBody.customerPayment
    expect(cp).toBeTruthy()
    let inv = (db.invoices || []).find(i => i.id === invoice.id)!
    expect(inv.balance).toBe(120)
    const beforeJCount = (db.journalEntries || []).length
    // void
    const voidRes: any = await CP_VOID(makeReq(`http://local/api/customer-payments/${cp.id}/void`, 'POST', { reversalDate: '2025-03-10' }) as any, { params: { id: cp.id } } as any)
    expect(voidRes.status).toBe(200)
    inv = (db.invoices || []).find(i => i.id === invoice.id)!
    expect(inv.balance).toBe(200)
    const afterJCount = (db.journalEntries || []).length
    expect(afterJCount).toBeGreaterThan(beforeJCount)
  })

  test('cannot void if payment deposited', async () => {
    const { invoice, customerId } = await seedInvoice(140)
    // create payment and deposit it
    const payRes: any = await CP_POST(makeReq('http://local/api/customer-payments', 'POST', { customerId, amountReceived: 60, date: '2025-03-09', allocations: [{ invoiceId: invoice.id, amount: 60 }], depositAccountNumber: '1010' }) as any)
    const payBody = await payRes.json()
    const cp = payBody.customerPayment
    const undepRes: any = await UNDEP_GET()
    const undep = await undepRes.json()
    const ids = undep.payments.map((p: any) => p.id)
    const depRes: any = await DEPOSITS_POST(makeReq('http://local/api/deposits', 'POST', { paymentIds: ids }) as any)
    expect(depRes.status).toBe(200)
    const voidRes: any = await CP_VOID(makeReq(`http://local/api/customer-payments/${cp.id}/void`, 'POST') as any, { params: { id: cp.id } } as any)
    expect(voidRes.status).toBe(400)
    const body = await voidRes.json()
    expect(String(body.error || '')).toMatch(/deposited/i)
  })
})
