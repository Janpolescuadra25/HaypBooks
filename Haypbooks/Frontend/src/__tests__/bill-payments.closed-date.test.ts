import { mockApi } from '@/lib/mock-api'
import { db } from '@/mock/db'

async function createBill(total = 120, billDate = '2025-03-10') {
  const body = { vendorId: db.vendors[0]?.id || 'ven_1', items: [{ description: 'Line', amount: total }], billDate, terms: 'Net 0' }
  const res = await mockApi<any>('http://localhost/api/bills', { method: 'POST', body: JSON.stringify(body) })
  return res.bill
}

async function closeThrough(dateIso: string) {
  await mockApi<any>('http://localhost/api/settings/close-period', { method: 'POST', body: JSON.stringify({ date: dateIso }) })
}

async function reopen() {
  await mockApi<any>('http://localhost/api/settings/reopen-period', { method: 'POST' })
}

describe('Bill payments enforce provided payment date against closed periods', () => {
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
    await mockApi<any>('http://localhost/api/vendors', { method: 'GET' })
  })

  test('POST /api/bills/:id/payments rejects when date <= closeDate, accepts after reopen', async () => {
    const bill = await createBill(120, '2025-03-10')
    const todayIso = new Date().toISOString().slice(0,10)
    await closeThrough(todayIso)
    // attempt to pay with an explicit backdated date at or before closed date
    await expect(
      mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: 20, date: todayIso }) })
    ).rejects.toThrow(/closed period/i)
    await reopen()
    const ok = await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: 20, date: todayIso }) })
    expect(ok.payment).toBeTruthy()
    expect(ok.payment.date.slice(0,10)).toBe(todayIso)
  })
})
