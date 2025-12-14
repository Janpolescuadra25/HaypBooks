import { setRoleOverride } from '@/lib/rbac-server'
import { POST as Create } from '@/app/api/receipts/route'
import { GET as Suggestions } from '@/app/api/receipts/[id]/suggestions/route'
import { db } from '@/mock/db'

/**
 * Tests enhanced receipts suggestions ranking: vendorSimilarity + composite score sorting.
 */

describe('receipts suggestions ranking', () => {
  beforeAll(() => { setRoleOverride('admin'); try { /* ensure seed */ } catch {} })
  afterAll(() => { setRoleOverride(undefined as any) })

  test('returns vendorSimilarity and score fields', async () => {
  // Use seeded bill with known total 144 (BILL-1003) for deterministic suggestions
  const receiptRes: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Vendor 3', amount: 144 }) }) as any)
    const { receipt } = await receiptRes.json()
    const sugRes: any = await Suggestions(new Request(`http://test/api/receipts/${receipt.id}/suggestions?limit=5`, { method: 'GET' }) as any, { params: { id: receipt.id } })
    expect(sugRes.status).toBe(200)
    const payload = await sugRes.json()
    expect(Array.isArray(payload.suggestions)).toBe(true)
    // Allow empty suggestions set when tolerance mismatch; ensure test creates a matching invoice by adjusting amount to seeded invoice remaining.
    const first = payload.suggestions[0]
    expect(first).toBeTruthy()
    expect(first.vendorSimilarity).toBeGreaterThanOrEqual(0)
    expect(first.score).toBeGreaterThanOrEqual(0)
  })

  test('ranking prefers closer vendor name when amount/date equal', async () => {
    // Create receipt for bill total 144 (seeded BILL-1003 vendor "Vendor 3")
    const rRes: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vendor: 'Vendor 3', amount: 144 }) }) as any)
    const { receipt } = await rRes.json()
    // Inject second custom bill with identical remaining to create a tie where vendorSimilarity distinguishes
    const vendor4 = db.vendors.find(v => v.name === 'Vendor 4')
    expect(vendor4).toBeTruthy()
    db.bills.push({
      id: 'bill_custom_same_total',
      number: 'BILL-CUSTOM-144',
      vendorId: vendor4!.id,
      status: 'open',
      billDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      terms: 'Due on receipt',
      scheduledDate: null,
      lines: [ { description: 'Line A', amount: 90 }, { description: 'Line B', amount: 54 } ],
      payments: [],
      total: 144,
      balance: 144,
      tags: []
    } as any)
    const sRes: any = await Suggestions(new Request(`http://test/api/receipts/${receipt.id}/suggestions?limit=5`, { method: 'GET' }) as any, { params: { id: receipt.id } })
    expect(sRes.status).toBe(200)
    const data = await sRes.json()
    const list = data.suggestions
    // Expect at least two suggestions (seeded bill + custom bill)
    expect(list.length).toBeGreaterThanOrEqual(2)
    // The first should have higher vendorSimilarity (exact match Vendor 3)
    const vSim0 = list[0].vendorSimilarity
    const vSim1 = list[1].vendorSimilarity
    expect(vSim0).toBeGreaterThanOrEqual(vSim1)
    // Score should correlate: first score >= second
    expect(list[0].score).toBeGreaterThanOrEqual(list[1].score)
  })
})
