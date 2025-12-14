import { seedIfNeeded, createInvoice, voidInvoice, createAdjustingJournal, db } from '@/mock/db'
import { mockApi } from '@/lib/mock-api'
import { assertBalanced } from '../test-utils/assertBalanced'

/**
 * Extended Audit API tests for filtering & pagination.
 */

describe('Audit API filtering & pagination', () => {
  beforeAll(() => { seedIfNeeded() })

  test('returns rows with appliedFilters metadata', async () => {
    const res = await mockApi<any>('/api/audit?limit=5')
    expect(res.rows).toBeTruthy()
    expect(Array.isArray(res.rows)).toBe(true)
    expect(res.appliedFilters.limit).toBe(5)
    expect(typeof res.total).toBe('number')
  })

  test('filters by entity and action', async () => {
    const inv = createInvoice({ number: 'AUD-FLT-1', customerId: db.customers[0].id, date: new Date().toISOString(), lines: [ { description: 'X', amount: 120 } ] })
    inv.status = 'sent'
    voidInvoice(inv.id, { createReversing: true })
    assertBalanced('audit filter after void invoice')
    const filtered = await mockApi<any>('/api/audit?entity=invoice&action=void&limit=10')
    expect(filtered.rows.length).toBeGreaterThan(0)
    expect(filtered.rows.every((r: any) => r.entityType === 'invoice' && r.action === 'void')).toBe(true)
  })

  test('filters by actor (system placeholder)', async () => {
    const res = await mockApi<any>('/api/audit?actor=system&limit=5')
    // All generated events currently have actor system
    expect(res.rows.every((r: any) => r.actor === 'system')).toBe(true)
  })

  test('cursor pagination returns nextCursor and advances', async () => {
    // Generate a few events: adjusting journal, void bill, etc.
    createAdjustingJournal({ date: new Date().toISOString().slice(0,10), lines: [ { accountNumber: '6000', debit: 50 }, { accountNumber: '2000', credit: 50 } ], reversing: false })
    const first = await mockApi<any>('/api/audit?limit=3')
    expect(first.rows.length).toBeGreaterThan(0)
    if (first.nextCursor) {
      const second = await mockApi<any>(`/api/audit?limit=3&cursor=${first.nextCursor}`)
      // Ensure we advanced (IDs differ)
      const overlap = first.rows.some((r: any) => second.rows.find((s: any) => s.id === r.id))
      expect(overlap).toBe(false)
    }
  })
})
