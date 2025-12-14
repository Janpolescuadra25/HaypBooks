import { POST as POST_SEND } from '@/app/api/customers/[id]/statement/send/route'
import { setRoleOverride } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

/**
 * Statement send API tests
 * Covers RBAC (403), validation (400), and success shape (200)
 */

describe('Statement send API', () => {
  afterEach(() => {
    // Reset role override to default admin after each test
    setRoleOverride(undefined as any)
  })

  test('returns 403 when lacking statements:send', async () => {
    seedIfNeeded()
    const anyCustomerId = db.customers[0]?.id || 'cust_missing'
    setRoleOverride('viewer' as any) // viewer lacks statements:send
    const req = new Request('http://localhost/api/customers/' + anyCustomerId + '/statement/send', { method: 'POST', body: JSON.stringify({ asOf: '2025-09-04', type: 'summary' }) })
    const res: any = await POST_SEND(req, { params: { id: anyCustomerId } })
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json?.error).toBeTruthy()
  })

  test('returns 400 on invalid asOf date', async () => {
    seedIfNeeded()
    const anyCustomerId = db.customers[1]?.id || db.customers[0]?.id
    setRoleOverride('admin' as any)
    const req = new Request('http://localhost/api/customers/' + anyCustomerId + '/statement/send', { method: 'POST', body: JSON.stringify({ asOf: 'not-a-date', type: 'summary' }) })
    const res: any = await POST_SEND(req, { params: { id: anyCustomerId! } })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect((json?.error || '').toLowerCase()).toContain('asof')
  })

  test('queues a send and returns result payload', async () => {
    seedIfNeeded()
    const targetId = db.customers[2]?.id || db.customers[0]?.id!
    setRoleOverride('admin' as any)
    const req = new Request('http://localhost/api/customers/' + targetId + '/statement/send', { method: 'POST', body: JSON.stringify({ asOf: '2025-09-04', type: 'detail' }) })
    const res: any = await POST_SEND(req, { params: { id: targetId } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json?.result?.id).toBe(targetId)
    expect(json?.result?.status).toBe('queued')
    expect(typeof json?.result?.messageId).toBe('string')
    expect((json?.result?.queuedAt || '').length).toBeGreaterThan(10)
    expect(json?.customer?.id).toBe(targetId)
  })
})
