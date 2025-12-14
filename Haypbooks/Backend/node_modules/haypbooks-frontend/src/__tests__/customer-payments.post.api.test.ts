import { db } from '@/mock/db'
import { mockApi } from '@/lib/mock-api'
import { POST as CP_POST } from '@/app/api/customer-payments/route'
import { GET as UNDEP_GET } from '@/app/api/undeposited-payments/route'
import { POST as PERIODS_POST } from '@/app/api/periods/route'

const makeReq = (url: string, method: string, body?: any) => new Request(url, { method, body: body ? JSON.stringify(body) : undefined })

async function createInvoiceAndSend(total = 150, date = '2025-03-05') {
  // seed via any GET call
  await mockApi<any>('http://localhost/api/customers', { method: 'GET' })
  const custId = db.customers[0]?.id || 'cust_1'
  const body = { customerId: custId, number: `INV-CP-${Math.floor(Math.random()*10000)}`, date, lines: [{ description: 'Line', amount: total }] }
  const res = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify(body) })
  // mark as sent so it can accept payments
  await mockApi<any>(`http://localhost/api/invoices/${res.invoice.id}`, { method: 'PUT', body: JSON.stringify({ status: 'sent' }) })
  return { invoice: res.invoice, customerId: custId }
}

describe('Customer Payments POST API', () => {
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

  test('creates a payment to Undeposited Funds and updates invoice balance', async () => {
    const { invoice, customerId } = await createInvoiceAndSend(120, '2025-03-10')
    const payload = {
      customerId,
      amountReceived: 50,
      date: '2025-03-11',
      allocations: [{ invoiceId: invoice.id, amount: 50 }],
      autoCreditUnapplied: false,
      depositAccountNumber: '1010',
    }
    const res: any = await CP_POST(makeReq('http://local/api/customer-payments', 'POST', payload) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.customerPayment).toBeTruthy()
    const upd = body.invoices.find((x: any) => x.id === invoice.id)
    expect(upd).toBeTruthy()
    expect(Number(upd.balance)).toBe(70)
    // should appear in undeposited payments
    const undepRes: any = await UNDEP_GET()
    const undep = await undepRes.json()
    expect(Array.isArray(undep.payments)).toBe(true)
    const found = undep.payments.find((p: any) => p.invoiceId === invoice.id && Number(p.amount) === 50)
    expect(found).toBeTruthy()
  })

  test('blocked when date is within closed period', async () => {
    const { invoice, customerId } = await createInvoiceAndSend(100, '2025-04-01')
    const todayIso = new Date().toISOString().slice(0,10)
    // close through today
    const closeRes: any = await PERIODS_POST(makeReq('http://local/api/periods', 'POST', { closeThrough: todayIso }))
    expect(closeRes.status).toBe(200)
    // attempt with explicit closed date
    const payload = {
      customerId,
      amountReceived: 40,
      date: todayIso,
      allocations: [{ invoiceId: invoice.id, amount: 40 }],
      autoCreditUnapplied: false,
      depositAccountNumber: '1010',
    }
    const res: any = await CP_POST(makeReq('http://local/api/customer-payments', 'POST', payload) as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(String(body.error || '')).toMatch(/closed/i)
  })
})
