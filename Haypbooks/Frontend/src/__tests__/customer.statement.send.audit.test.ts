import { POST as POST_SEND } from '@/app/api/customers/[id]/statement/send/route'
import { GET as GET_AUDIT } from '@/app/api/customers/[id]/statement/audit/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string, method: string = 'POST') { return new Request(url, { method }) }

describe('Customer Statement Send & Audit', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('RBAC enforced for send', async () => {
    setRoleOverride('viewer' as any) // lacks statements:send
    const cust = db.customers[0]
    const res: any = await POST_SEND(makeReq(`http://local/api/customers/${cust.id}/statement/send?asOf=2025-10-01&type=summary`), { params: { id: cust.id } } as any)
    expect(res.status).toBe(403)
  })

  test('Validation errors for bad params', async () => {
    setRoleOverride('admin' as any)
    const cust = db.customers[0]
    const res: any = await POST_SEND(makeReq(`http://local/api/customers/${cust.id}/statement/send?asOf=bad-date&type=weird`), { params: { id: cust.id } } as any)
    expect(res.status).toBe(400)
  })

  test('404 when customer missing (with seeded customers present)', async () => {
    setRoleOverride('admin' as any)
    const res: any = await POST_SEND(makeReq(`http://local/api/customers/does_not_exist/statement/send?asOf=2025-10-01&type=summary`), { params: { id: 'does_not_exist' } } as any)
    expect(res.status).toBe(404)
  })

  test('Successful send creates audit event retrievable via audit route', async () => {
    setRoleOverride('admin' as any)
    const cust = db.customers[0]
    const res: any = await POST_SEND(makeReq(`http://local/api/customers/${cust.id}/statement/send?asOf=2025-10-01&type=detail`), { params: { id: cust.id } } as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json?.result?.status).toBe('queued')
    expect(json?.result?.messageId).toBeTruthy()
    // Audit requires audit:read
    setRoleOverride('viewer' as any) // viewer lacks audit:read
    let auditRes: any = await GET_AUDIT(makeReq(`http://local/api/customers/${cust.id}/statement/audit`), { params: { id: cust.id } } as any)
    expect(auditRes.status).toBe(403)
    setRoleOverride('admin' as any)
    auditRes = await GET_AUDIT(makeReq(`http://local/api/customers/${cust.id}/statement/audit`), { params: { id: cust.id } } as any)
    expect(auditRes.status).toBe(200)
    const auditJson = await auditRes.json()
    const ev = auditJson.events.find((e: any) => e.after?.messageId === json.result.messageId)
    expect(ev).toBeTruthy()
    expect(auditJson.events.length).toBeGreaterThan(0)
  })
})
