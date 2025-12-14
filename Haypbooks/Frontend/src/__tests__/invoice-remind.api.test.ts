import { seedIfNeeded, db, createInvoice, updateInvoice } from '@/mock/db'
import { POST as REMIND_POST } from '@/app/api/invoices/[id]/remind/route'

/**
 * Tests single invoice reminder endpoint throttle + counters
 */
describe('Invoice Single Reminder API', () => {
  beforeAll(() => { seedIfNeeded() })

  test('reminder first send ok then throttled within 5 days', async () => {
    const custId = 'single_remind_cust'
    if (!db.customers.find(c => c.id === custId)) db.customers.push({ id: custId, name: 'Single Remind Customer' } as any)
    const inv = createInvoice({ number: 'SR1', customerId: custId, date: '2025-03-10', lines: [{ description: 'X', amount: 250 }] })
    updateInvoice(inv.id, { status: 'sent' })

    // First reminder
    let res: any = await REMIND_POST(new Request(`http://localhost/api/invoices/${inv.id}/remind`, { method: 'POST' }), { params: { id: inv.id } })
    expect(res.status).toBe(200)
    let body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.invoice.reminderCount).toBe(1)
    expect(body.invoice.lastReminderDate).toBeDefined()

    // Second same-day reminder should throttle
    res = await REMIND_POST(new Request(`http://localhost/api/invoices/${inv.id}/remind`, { method: 'POST' }), { params: { id: inv.id } })
    expect(res.status).toBe(200)
    body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.message).toMatch(/Throttled/)
    // Counters unchanged
    expect(body.invoice.reminderCount).toBe(1)
  })
})
