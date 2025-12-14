import { mockApi } from '@/lib/mock-api'
import { seedIfNeeded } from '@/mock/db'

describe('Audit: invoice void filtered by entityId', () => {
  beforeAll(() => { seedIfNeeded() })

  async function createInvoice() {
    const body = {
      number: `INV-VOID-AUD-${Math.floor(Math.random() * 100000)}`,
      customer: 'Customer 1',
      lines: [{ description: 'Service', amount: 180 }],
      date: new Date().toISOString().slice(0, 10),
    }
    const res = await mockApi<any>('/api/invoices', { method: 'POST', body: JSON.stringify(body) })
    return res.invoice
  }

  async function fetchAudit(entityId: string) {
    return await mockApi<any>(`/api/audit?entity=invoice&entityId=${encodeURIComponent(entityId)}&action=void&limit=20`)
  }

  test('void event includes meta and is filterable by entityId', async () => {
    const inv = await createInvoice()

    // Ensure it is posted/sent prior to void to emulate real flow
    const sent = await mockApi<any>(`/api/invoices/${inv.id}/send`, { method: 'POST' })
    expect(['sent', 'overdue'].includes(sent.invoice.status)).toBe(true)

    const reason = 'Test void for audit'
    const reversalDate = new Date().toISOString().slice(0,10)
    const voidRes = await mockApi<any>(`/api/invoices/${inv.id}/void`, {
      method: 'POST',
      body: JSON.stringify({ createReversing: true, reason, reversalDate })
    })
    expect(voidRes.invoice.status).toBe('void')

    const audit = await fetchAudit(inv.id)
    expect(audit.rows.length).toBeGreaterThan(0)
    const evt = audit.rows.find((r: any) => r.action === 'void' && r.entityId === inv.id)
    expect(evt).toBeTruthy()
    // Meta expectations
    expect(evt.meta).toBeTruthy()
    expect(evt.meta.reason).toBe(reason)
    expect(evt.meta.reversalDate).toBe(reversalDate)
    // reversingId should be present when createReversing=true and invoice had been posted
    expect(evt.meta.reversingId).toBeDefined()
  })
})
