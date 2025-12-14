import { POST as SEND_POST } from '@/app/api/customers/[id]/statement/send/route'
import { GET as AUDIT_GET } from '@/app/api/customers/[id]/statement/audit/route'
import { db, seedIfNeeded } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac-server'

const postReq = (url: string, init?: RequestInit) => new Request(url, { method: 'POST', ...(init||{}) })
const getReq = (url: string) => new Request(url)

describe('Statement send snapshot behaviour', () => {
  beforeEach(() => { seedIfNeeded(); setRoleOverride(undefined as any) })
  afterEach(() => setRoleOverride(undefined as any))

  test('messageOverride is saved in audit snapshot', async () => {
    setRoleOverride('admin' as any)
    // ensure the customer exists in the mock DB so send will succeed
    db.customers = db.customers || []
    db.customers.push({ id: 'cust-123', name: 'Snapshot Test Customer' })
    const override = 'Pay now or we will sing to you'
    const res: any = await SEND_POST(postReq('http://localhost/api/customers/cust-123/statement/send?asOf=2025-10-01', { body: JSON.stringify({ messageOverride: override }) }), { params: { id: 'cust-123' } } as any)
    expect(res.status).toBe(200)
    const rbody = await res.json()
    const messageId = rbody?.result?.messageId
    expect(typeof messageId).toBe('string')

    // read audit events for that id
    const auditRes: any = await AUDIT_GET(getReq('http://localhost/api/customers/cust-123/statement/audit'), { params: { id: 'cust-123' } } as any)
    expect(auditRes.status).toBe(200)
    const body = await auditRes.json()
    expect(Array.isArray(body.events)).toBe(true)
    const ev = body.events.find((e:any)=> e.after && e.after.messageId === messageId)
    expect(ev).toBeDefined()
    expect(ev.after.messageSnapshot).toBe(override)
  })

  test('messageId resolved to library text is saved in snapshot', async () => {
    setRoleOverride('admin' as any)
    db.customers = db.customers || []
    db.customers.push({ id: 'cust-777', name: 'Snapshot Test Customer 777' })
    // ensure at least one message exists
    if (!db.messages || db.messages.length === 0) {
      db.messages = [{ id: 'msg-x', name: 'X', body: 'X-body', authorId: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: [] }]
    }
    const mid = db.messages![0].id
    const res: any = await SEND_POST(postReq('http://localhost/api/customers/cust-777/statement/send?asOf=2025-10-01', { body: JSON.stringify({ messageId: mid }) }), { params: { id: 'cust-777' } } as any)
    expect(res.status).toBe(200)
    const rbody = await res.json()
    const messageId = rbody?.result?.messageId
    expect(messageId).toBe(mid)

    const auditRes: any = await AUDIT_GET(getReq('http://localhost/api/customers/cust-777/statement/audit'), { params: { id: 'cust-777' } } as any)
    const body = await auditRes.json()
    const ev = body.events.find((e:any)=> e.after && e.after.messageId === messageId)
    expect(ev).toBeDefined()
    expect(ev.after.messageSnapshot).toBe(db.messages![0].body)
  })
})
