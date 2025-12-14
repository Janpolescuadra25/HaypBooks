import { seedIfNeeded, db, createInvoice, updateInvoice, applyPaymentToInvoice } from '@/mock/db'
import { GET as COLLECTIONS_GET } from '@/app/api/collections/overview/route'

/**
 * Tests for Collections Overview endpoint aggregation ordering & totals.
 */

describe('Collections Overview API', () => {
  beforeAll(()=> { seedIfNeeded() })

  test('returns sorted rows with totals', async () => {
    // Create a few targeted customers to influence ordering
    const baseTs = Date.now()
    const makeCust = (suffix: string, creditLimit?: number) => {
      const c = { id: `coll_${suffix}_${baseTs}`, name: `Coll ${suffix}`, creditLimit }
      db.customers.push(c as any)
      return c
    }
    const highOverdue = makeCust('high', 1500)
    const lowRisk = makeCust('low', 5000)

    // High overdue: one old invoice partially unpaid
    const invHigh = createInvoice({ number: 'H1', customerId: highOverdue.id, date: '2025-01-01', dueDate: '2025-01-15', lines: [{ description: 'A', amount: 800 }] })
    updateInvoice(invHigh.id, { status: 'sent' })
    applyPaymentToInvoice(invHigh.id, 200)

    // Low risk: fresh invoice today
    const today = new Date().toISOString().slice(0,10)
    const invLow = createInvoice({ number: 'L1', customerId: lowRisk.id, date: today, lines: [{ description: 'B', amount: 300 }] })
    updateInvoice(invLow.id, { status: 'sent' })

  // Invoke route handler directly (avoid network + undici timers in test env)
  const req = new Request('http://localhost/api/collections/overview?asOf=' + today)
  const res: any = await COLLECTIONS_GET(req)
  expect(res.status).toBe(200)
  const json = await res.json()
    const { overview } = json
    expect(Array.isArray(overview.rows)).toBe(true)
    expect(overview.rows.length).toBeGreaterThan(0)
    // Ensure required fields are present for first row
    const r0 = overview.rows[0]
    for (const f of ['customerId','name','openInvoices','openBalance','overdueBalance','netReceivable','riskLevel']) {
      expect(r0).toHaveProperty(f)
    }
    // Ordering: high overdue should rank ahead (risk likely elevated/critical)
  const highIdx = overview.rows.findIndex((r: any)=>r.customerId===highOverdue.id)
  const lowIdx = overview.rows.findIndex((r: any)=>r.customerId===lowRisk.id)
    expect(highIdx).toBeGreaterThanOrEqual(0)
    expect(lowIdx).toBeGreaterThanOrEqual(0)
    expect(highIdx).toBeLessThan(lowIdx)
    // Totals sanity
    expect(overview.totals.openBalance).toBeGreaterThan(0)
    expect(overview.totals.netReceivable).toBeGreaterThan(0)
  })
})
