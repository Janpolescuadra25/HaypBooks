import { mockApi } from '@/lib/mock-api'
import { seedIfNeeded } from '@/mock/db'

/**
 * Verify bill void audit event is filterable by entityId and includes meta fields.
 */

describe('Audit: bill void filtered by entityId', () => {
  beforeAll(() => { seedIfNeeded() })

  async function createBill() {
    const body = {
      number: `BILL-VOID-AUD-${Math.floor(Math.random() * 100000)}`,
      vendor: 'Vendor 1',
      items: [{ description: 'Materials', amount: 140 }],
      dueDate: new Date().toISOString().slice(0, 10),
    }
    const res = await mockApi<any>('/api/bills', { method: 'POST', body: JSON.stringify(body) })
    return res.bill
  }

  async function fetchAudit(entityId: string) {
    return await mockApi<any>(`/api/audit?entity=bill&entityId=${encodeURIComponent(entityId)}&action=void&limit=20`)
  }

  test('void event includes meta and is filterable by entityId', async () => {
    const bill = await createBill()

    const reason = 'Test bill void for audit'
    const reversalDate = new Date().toISOString().slice(0,10)
    const voidRes = await mockApi<any>(`/api/bills/${bill.id}/void`, {
      method: 'POST',
      body: JSON.stringify({ createReversing: true, reason, reversalDate })
    })
    expect(voidRes.bill.status).toBe('void')

    const audit = await fetchAudit(bill.id)
    expect(audit.rows.length).toBeGreaterThan(0)
    const evt = audit.rows.find((r: any) => r.action === 'void' && r.entityId === bill.id)
    expect(evt).toBeTruthy()
    expect(evt.meta).toBeTruthy()
    expect(evt.meta.reason).toBe(reason)
    expect(evt.meta.reversalDate).toBe(reversalDate)
    expect(evt.meta.reversingId).toBeDefined()
  })
})
