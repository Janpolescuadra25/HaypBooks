import { POST as SEND_POST } from '@/app/api/customers/[id]/statement/send/route'
import { setRoleOverride } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

const makeReq = (url: string, init?: RequestInit) => new Request(url, { method: 'POST', ...(init||{}) })

describe('Customer Statement send API', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('blocks when role lacks permission', async () => {
    setRoleOverride('viewer' as any)
    // Ensure no seeded customers so existence check won't interfere (403 short-circuits regardless)
    db.customers.length = 0
    const res: any = await SEND_POST(makeReq('http://localhost/api/customers/cust-1/statement/send?asOf=2025-09-30&type=summary'), { params: { id: 'cust-1' } } as any)
    expect(res.status).toBe(403)
  })

  test('400 on invalid parameters', async () => {
    setRoleOverride('admin' as any)
    // Ensure the test customer exists so validation runs
    db.customers = db.customers || []
    db.customers.push({ id: 'cust-2', name: 'Test2' })
    const res: any = await SEND_POST(makeReq('http://localhost/api/customers/cust-2/statement/send?asOf=2025-13-40&type=weird'), { params: { id: 'cust-2' } } as any)
    expect(res.status).toBe(400)
  })

  test('queues a statement and returns payload fields when permitted', async () => {
    setRoleOverride('admin' as any)
    // Ensure the test customer exists so the send endpoint can queue
    db.customers = db.customers || []
    db.customers.push({ id: 'cust-42', name: 'Test 42' })
    const url = 'http://localhost/api/customers/cust-42/statement/send?asOf=2025-10-01&start=2025-09-01&type=summary'
    const res: any = await SEND_POST(makeReq(url), { params: { id: 'cust-42' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('result')
    const p = body.result
    expect(p.id).toBe('cust-42')
    expect(p.asOf).toBe('2025-10-01')
    expect(p.start).toBe('2025-09-01')
    expect(p.type).toBe('summary')
    expect(p.status).toBe('queued')
    expect(typeof p.messageId).toBe('string')
    expect(typeof p.queuedAt).toBe('string')
  })

  test('accepts type=detail and returns queued payload', async () => {
    setRoleOverride('admin' as any)
    // Ensure the test customer exists so the send endpoint can queue
    db.customers = db.customers || []
    db.customers.push({ id: 'cust-42', name: 'Test 42' })
    const url = 'http://localhost/api/customers/cust-42/statement/send?asOf=2025-10-01&type=detail'
    const res: any = await SEND_POST(makeReq(url), { params: { id: 'cust-42' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body?.result?.type).toBe('detail')
    expect(body?.result?.status).toBe('queued')
  })

  test('404 when customer does not exist', async () => {
    setRoleOverride('admin' as any)
    // Seed customers so existence check is enforced
    seedIfNeeded()
    const url = 'http://localhost/api/customers/does-not-exist/statement/send?asOf=2025-10-01&type=summary'
    const res: any = await SEND_POST(makeReq(url), { params: { id: 'does-not-exist' } } as any)
    expect(res.status).toBe(404)
  })
})
