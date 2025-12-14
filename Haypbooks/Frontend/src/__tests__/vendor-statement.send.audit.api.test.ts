import { POST as VENDOR_SEND_POST } from '@/app/api/vendors/[id]/statement/send/route'
import { GET as CUSTOMER_AUDIT_GET } from '@/app/api/customers/[id]/statement/audit/route'
import { setRoleOverride } from '@/lib/rbac-server'
import { db, seedIfNeeded } from '@/mock/db'

const postReq = (url: string) => new Request(url, { method: 'POST' })
const getReq = (url: string) => new Request(url)

describe('Vendor Statement send API + audit parity', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('forbidden without bills:write', async () => {
    setRoleOverride('viewer' as any)
    db.vendors.length = 0
    const res: any = await VENDOR_SEND_POST(postReq('http://localhost/api/vendors/ven-X/statement/send?asOf=2025-10-01'), { params: { id: 'ven-X' } } as any)
    expect(res.status).toBe(403)
  })

  test('400 on bad dates', async () => {
    setRoleOverride('admin' as any)
    db.vendors.length = 0
    const res: any = await VENDOR_SEND_POST(postReq('http://localhost/api/vendors/ven-1/statement/send?asOf=bad-date'), { params: { id: 'ven-1' } } as any)
    expect(res.status).toBe(400)
  })

  test('404 when seeded and vendor missing', async () => {
    setRoleOverride('admin' as any)
    seedIfNeeded()
    const res: any = await VENDOR_SEND_POST(postReq('http://localhost/api/vendors/nope/statement/send?asOf=2025-10-01'), { params: { id: 'nope' } } as any)
    expect(res.status).toBe(404)
  })

  test('queues event when allowed (unseeded vendors)', async () => {
    setRoleOverride('admin' as any)
    db.vendors.length = 0
    const res: any = await VENDOR_SEND_POST(postReq('http://localhost/api/vendors/ven-42/statement/send?asOf=2025-10-01&start=2025-09-01&type=open-item'), { params: { id: 'ven-42' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body?.result?.status).toBe('queued')
    // Verify audit is recorded via the shared audit endpoint (customers path filters by action; we reuse it for verification scope)
    const audit: any = await CUSTOMER_AUDIT_GET(getReq('http://localhost/api/customers/ven-42/statement/audit'), { params: { id: 'ven-42' } } as any)
    expect(audit.status).toBe(200)
    const abody = await audit.json()
    const hasVendorEvent = (abody.events || []).some((e: any) => e.entityType === 'vendor' && e.entityId === 'ven-42')
    expect(hasVendorEvent).toBe(true)
  })
})
