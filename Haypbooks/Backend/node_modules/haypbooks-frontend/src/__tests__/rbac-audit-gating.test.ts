import { mockApi } from '@/lib/mock-api'
import { db, createInvoice, voidInvoice } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

/**
 * RBAC gating tests for audit:read permission.
 * Note: In this environment, cookies() may not persist across calls; we simulate by directly invoking setRoleCookie where possible.
 */

describe('RBAC audit gating', () => {
  beforeAll(() => { if (!db.seeded) { /* seed invoked lazily by mockApi */ } })

  test('admin role can read audit', async () => {
  setRoleOverride('admin')
    const res = await mockApi<any>('/api/audit?limit=3')
    expect(res.rows || res.events).toBeTruthy()
  })

  test('viewer without audit:read is blocked', async () => {
  setRoleOverride('viewer')
    let error: any = null
    try {
      await mockApi<any>('/api/audit?limit=1')
    } catch (e:any) {
      error = e
    }
    expect(String(error || '')).toMatch(/403/i)
  })

  test('invoice void generates audit event visible to admin only', async () => {
  setRoleOverride('admin')
    const inv = createInvoice({ number: 'RBAC-AUD-INV', customerId: db.customers[0].id, date: new Date().toISOString(), lines: [ { description: 'Svc', amount: 50 } ] })
    inv.status = 'sent'
    voidInvoice(inv.id, { createReversing: true })
    const res = await mockApi<any>('/api/audit?action=void&entity=invoice&limit=25')
    expect(res.rows.some((r:any) => r.action === 'void' && r.entityType === 'invoice')).toBe(true)
  setRoleOverride('viewer')
  await expect(mockApi<any>('/api/audit?action=void&entity=invoice&limit=25')).rejects.toThrow(/403/i)
  })
})
