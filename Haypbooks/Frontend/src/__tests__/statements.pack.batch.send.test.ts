import { POST as BATCH_SEND } from '@/app/api/customers/statements/pack/send/route'
import { GET as BATCH_AUDIT } from '@/app/api/customers/statements/pack/audit/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string, opts: any = {}) { return new Request(url, { method: 'POST', ...opts }) }
function makeGet(url: string) { return new Request(url) }

describe('Batch customer statements send', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('RBAC 403 when lacking statements:send', async () => {
    setRoleOverride('viewer' as any) // viewer has reports:read but not statements:send
    const res: any = await BATCH_SEND(makeReq('http://local/api/customers/statements/pack/send?asOf=2025-10-15'))
    expect(res.status).toBe(403)
  })

  test('Validation 400 for bad date/type', async () => {
    setRoleOverride('manager' as any)
    const res: any = await BATCH_SEND(makeReq('http://local/api/customers/statements/pack/send?asOf=not-a-date&type=weird'))
    expect(res.status).toBe(400)
  })

  test('404 when explicit unknown customer id provided', async () => {
    setRoleOverride('manager' as any)
    const res: any = await BATCH_SEND(makeReq('http://local/api/customers/statements/pack/send?asOf=2025-10-15&customerId=__missing__'))
    // Only 404 if db seeded and id missing; seed ensures customers length > 0 so this should 404
    expect(res.status).toBe(404)
  })

  test('Successful batch send logs per-customer and batch audit events', async () => {
    setRoleOverride('manager' as any)
    const c1 = db.customers[0].id
    const c2 = db.customers[1].id
    const res: any = await BATCH_SEND(makeReq(`http://local/api/customers/statements/pack/send?asOf=2025-10-15&customerId=${c1},${c2}`))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.result.batchId).toBeTruthy()
    expect(json.result.count).toBe(2)
    const batchId = json.result.batchId
    // Inspect audit events
    const evts = (db.auditEvents || []).filter((e: any) => e?.after?.batchId === batchId)
    // Expect at least the two per-customer plus wrapper (3)
    expect(evts.length).toBeGreaterThanOrEqual(3)
    const wrapper = (db.auditEvents || []).find((e: any) => e.action === 'statement:send:batch' && e.entityId === batchId)
    expect(wrapper).toBeTruthy()
  })

  test('Batch audit endpoint returns recent batch events and children filter', async () => {
    // Prefer a role with audit:read; try manager (has audit:read per RBAC policy in project) else fallback to admin
    setRoleOverride('manager' as any)
    const listRes: any = await BATCH_AUDIT(makeGet('http://local/api/customers/statements/pack/audit'))
    expect(listRes.status).toBe(200)
    const listJson = await listRes.json()
    expect(Array.isArray(listJson.events)).toBe(true)
    const first = listJson.events[0]
    if (first) {
      const detailRes: any = await BATCH_AUDIT(makeGet(`http://local/api/customers/statements/pack/audit?batchId=${first.entityId}`))
      expect(detailRes.status).toBe(200)
      const detailJson = await detailRes.json()
      expect(Array.isArray(detailJson.events)).toBe(true)
      expect(detailJson.events[0]?.entityId).toBe(first.entityId)
      // children may be empty if no per-customer events created yet, but structure must exist
      expect(Array.isArray(detailJson.children)).toBe(true)
    }
  })
})
