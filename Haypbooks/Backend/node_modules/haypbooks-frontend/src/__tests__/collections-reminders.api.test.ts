import { seedIfNeeded, db, createInvoice, updateInvoice, applyPaymentToInvoice } from '@/mock/db'
import { POST as COLLECTIONS_POST } from '@/app/api/collections/reminders/route'

/**
 * Tests POST /api/collections/reminders generates results for each customer
 */

describe('Collections Reminders API', () => {
  beforeAll(()=> { seedIfNeeded() })

  test('sends reminders for open invoices per customer', async () => {
    const base = Date.now()
    const custA = { id: `remA_${base}`, name: 'Reminder A' }
    const custB = { id: `remB_${base}`, name: 'Reminder B' }
    db.customers.push(custA as any, custB as any)
    // Customer A: two invoices, one partially paid
    const invA1 = createInvoice({ number: 'RA1', customerId: custA.id, date: '2025-03-01', lines: [{ description: 'Work', amount: 300 }] })
    updateInvoice(invA1.id, { status: 'sent' })
    const invA2 = createInvoice({ number: 'RA2', customerId: custA.id, date: '2025-03-05', lines: [{ description: 'Extra', amount: 200 }] })
    updateInvoice(invA2.id, { status: 'sent' })
    applyPaymentToInvoice(invA1.id, 100)
    // Customer B: one invoice fully open
    const invB1 = createInvoice({ number: 'RB1', customerId: custB.id, date: '2025-03-02', lines: [{ description: 'Stuff', amount: 150 }] })
    updateInvoice(invB1.id, { status: 'sent' })

  const body = JSON.stringify({ customerIds: [custA.id, custB.id] })
  const req = new Request('http://localhost/api/collections/reminders', { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })
  const res: any = await COLLECTIONS_POST(req)
  expect(res.status).toBe(200)
  const json = await res.json()
    expect(Array.isArray(json.results)).toBe(true)
    const a = json.results.find((r: any)=> r.customerId === custA.id)
    const b = json.results.find((r: any)=> r.customerId === custB.id)
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
    expect(a.results.length).toBeGreaterThanOrEqual(2)
    expect(b.results.length).toBe(1)
    // Each result item: { id, ok, message? }
    expect(a.results[0]).toHaveProperty('id')
    expect(a.results[0]).toHaveProperty('ok')
  })
})
