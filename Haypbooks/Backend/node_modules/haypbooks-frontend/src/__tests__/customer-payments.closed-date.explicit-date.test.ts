import { mockApi } from '@/lib/mock-api'
import { db } from '@/mock/db'

async function createInvoiceAndSend(total = 120, date = '2025-03-10') {
  const body = { customerId: db.customers[0]?.id || 'cust_1', number: `INV-EXP-${Math.floor(Math.random()*10000)}`, date, lines: [{ description: 'Line', amount: total }] }
  const res = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify(body) })
  // mark as sent so it can accept payments
  await mockApi<any>(`http://localhost/api/invoices/${res.invoice.id}`, { method: 'PUT', body: JSON.stringify({ status: 'sent' }) })
  return res.invoice
}

async function closeThrough(dateIso: string) {
  await mockApi<any>('http://localhost/api/settings/close-period', { method: 'POST', body: JSON.stringify({ date: dateIso }) })
}

async function reopen() {
  await mockApi<any>('http://localhost/api/settings/reopen-period', { method: 'POST' })
}

describe('Customer invoice payments enforce provided payment date against closed periods', () => {
  beforeEach(async () => {
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
    // seed via first mockApi call
    await mockApi<any>('http://localhost/api/customers', { method: 'GET' })
  })

  test('POST /api/invoices/:id/payments rejects when date <= closeDate, accepts after reopen; journal posts on provided date', async () => {
    const inv = await createInvoiceAndSend(120, '2025-03-10')
    const todayIso = new Date().toISOString().slice(0,10)
    await closeThrough(todayIso)

    // attempt with explicit date in closed period
    await expect(
      mockApi<any>(`http://localhost/api/invoices/${inv.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: 20, date: todayIso }) })
    ).rejects.toThrow(/closed period/i)

    await reopen()
    const ok = await mockApi<any>(`http://localhost/api/invoices/${inv.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: 20, date: todayIso }) })
    expect(ok.payment).toBeTruthy()
    expect(ok.payment.date.slice(0,10)).toBe(todayIso)

    // verify a journal entry was posted on that date for this payment (cash receipt)
    const jeOnDate = (db.journalEntries || []).find(j => j && j.linkedType === 'payment' && j.linkedId === ok.payment.id && typeof j.date === 'string' && j.date.slice(0,10) === todayIso)
    expect(jeOnDate).toBeTruthy()
  })
})
