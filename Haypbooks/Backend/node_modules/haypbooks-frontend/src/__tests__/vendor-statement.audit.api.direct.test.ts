import { GET as VENDOR_AUDIT_GET } from '@/app/api/vendors/[id]/statement/audit/route'
import { POST as VENDOR_SEND_POST } from '@/app/api/vendors/[id]/statement/send/route'
import { setRoleOverride } from '@/lib/rbac-server'
import { db } from '@/mock/db'

const getReq = (url: string) => new Request(url)
const postReq = (url: string) => new Request(url, { method: 'POST' })

describe('Vendor Statement audit API (direct)', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('403 without audit:read', async () => {
    setRoleOverride('viewer' as any)
    const res: any = await VENDOR_AUDIT_GET(getReq('http://localhost/api/vendors/ven-1/statement/audit'), { params: { id: 'ven-1' } } as any)
    expect(res.status).toBe(403)
  })

  test('lists vendor statement send events for a vendor', async () => {
    setRoleOverride('admin' as any)
    db.vendors.length = 0
    await VENDOR_SEND_POST(postReq('http://localhost/api/vendors/vendor-abc/statement/send?asOf=2025-10-01&type=open-item'), { params: { id: 'vendor-abc' } } as any)
    const res: any = await VENDOR_AUDIT_GET(getReq('http://localhost/api/vendors/vendor-abc/statement/audit'), { params: { id: 'vendor-abc' } } as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.events)).toBe(true)
    expect(body.events.some((e: any) => e.entityType === 'vendor' && e.entityId === 'vendor-abc')).toBe(true)
  })
})
