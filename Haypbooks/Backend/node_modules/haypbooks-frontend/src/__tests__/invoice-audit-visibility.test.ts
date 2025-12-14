import { mockApi } from '@/lib/mock-api'
import { seedIfNeeded } from '@/mock/db'

describe('Invoice audit visibility', () => {
  beforeAll(() => { seedIfNeeded() })

  async function createInvoice() {
    const body = {
      number: `INV-AUD-${Math.floor(Math.random() * 100000)}`,
      customer: 'Customer 1',
      lines: [{ description: 'Service', amount: 100 }],
      date: new Date().toISOString().slice(0, 10),
    }
    const res = await mockApi<any>('/api/invoices', { method: 'POST', body: JSON.stringify(body) })
    return res.invoice
  }

  async function fetchAudit(entityId: string) {
    return await mockApi<any>(`/api/audit?entity=invoice&entityId=${encodeURIComponent(entityId)}&limit=50`)
  }

  test('create, send, update, payment events appear in audit', async () => {
    const inv = await createInvoice()

    // Create event
    let audit = await fetchAudit(inv.id)
    expect(audit.rows.some((r: any) => r.action === 'create' && r.entityId === inv.id)).toBe(true)

    // Send (records an update action with status sent/overdue)
    const sent = await mockApi<any>(`/api/invoices/${inv.id}/send`, { method: 'POST' })
    expect(['sent', 'overdue'].includes(sent.invoice.status)).toBe(true)

    audit = await fetchAudit(inv.id)
    const updateEvents = audit.rows.filter((r: any) => r.action === 'update')
    expect(updateEvents.length).toBeGreaterThan(0)
    expect(updateEvents.some((r: any) => r.after && (r.after.status === 'sent' || r.after.status === 'overdue'))).toBe(true)

    // Update number
    const upd = await mockApi<any>(`/api/invoices/${inv.id}`, { method: 'PUT', body: JSON.stringify({ number: sent.invoice.number + '-REV1' }) })
    expect(upd.invoice.number.endsWith('-REV1')).toBe(true)

    audit = await fetchAudit(inv.id)
    const updateEvents2 = audit.rows.filter((r: any) => r.action === 'update')
    expect(updateEvents2.length).toBeGreaterThanOrEqual(updateEvents.length)

    // Payment (records apply-payment with meta.payment)
    const pay = await mockApi<any>(`/api/invoices/${inv.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: 50 }) })
    expect(pay.payment && pay.payment.amount).toBe(50)

    audit = await fetchAudit(inv.id)
    const paymentEvents = audit.rows.filter((r: any) => r.action === 'apply-payment')
    expect(paymentEvents.length).toBeGreaterThan(0)
    expect(paymentEvents.some((r: any) => r.meta && r.meta.payment && r.meta.payment.amount === 50)).toBe(true)
  })
})
