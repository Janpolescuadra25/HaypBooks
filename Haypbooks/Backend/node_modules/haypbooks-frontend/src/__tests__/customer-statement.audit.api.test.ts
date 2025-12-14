import { GET as AUDIT_GET } from '@/app/api/customers/[id]/statement/audit/route'
import { POST as SEND_POST } from '@/app/api/customers/[id]/statement/send/route'
import { setRoleOverride } from '@/lib/rbac-server'
import { db } from '@/mock/db'

const getReq = (url: string) => new Request(url)
const postReq = (url: string) => new Request(url, { method: 'POST' })

describe('Customer Statement audit API', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('blocks when role lacks audit:read', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await AUDIT_GET(getReq('http://localhost/api/customers/cust-1/statement/audit'), { params: { id: 'cust-1' } } as any)
    expect(res.status).toBe(403)
  })

  test('returns recent statement send events for the customer', async () => {
    setRoleOverride('admin' as any)
    // Seed a send event by calling the send API
    // Ensure unseeded customers so arbitrary id is allowed
    db.customers.length = 0
    await SEND_POST(postReq('http://localhost/api/customers/cust-99/statement/send?asOf=2025-10-01&type=summary'), { params: { id: 'cust-99' } } as any)
    const res: any = await AUDIT_GET(getReq('http://localhost/api/customers/cust-99/statement/audit'), { params: { id: 'cust-99' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.events)).toBe(true)
    expect(body.events.length).toBeGreaterThanOrEqual(1)
    const e = body.events[0]
    expect(e.action).toBe('statement:send')
    expect(e.entityId).toBe('cust-99')
  })
})
