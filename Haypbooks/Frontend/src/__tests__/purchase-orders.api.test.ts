// RBAC: allow toggling permissions per test
const mockRBAC = (canRead: boolean, canWrite: boolean) => {
  jest.doMock('@/lib/rbac-server', () => ({
    getRoleFromCookies: () => (canWrite ? 'admin' : 'viewer'),
    hasPermission: (_role: string, perm: string) => {
      if (perm === 'bills:read') return canRead
      if (perm === 'bills:write') return canWrite
      return false
    },
  }))
}

const makeReq = (url: string, init?: RequestInit) => new Request(url, init)

describe('Purchase Orders API routes', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('GET /api/purchase-orders denies without read permission', async () => {
    mockRBAC(false, false)
    const { GET } = await import('@/app/api/purchase-orders/route')
    const res: any = await GET(makeReq('http://localhost/api/purchase-orders'))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden' })
  })

  test('List returns hydrated vendor name', async () => {
    mockRBAC(true, true)
    const { GET } = await import('@/app/api/purchase-orders/route')
    const res: any = await GET(makeReq('http://localhost/api/purchase-orders'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.purchaseOrders)).toBe(true)
    if (body.purchaseOrders.length) {
      const row = body.purchaseOrders[0]
      expect(typeof row.vendor).toBe('string')
      expect(row.vendor).not.toBeFalsy()
    }
  })

  test('POST create validates and returns hydrated vendor', async () => {
    mockRBAC(true, true)
    const { POST } = await import('@/app/api/purchase-orders/route')
    const { seedIfNeeded, db } = await import('@/mock/db')
    seedIfNeeded()
    const payload = {
      vendorId: db.vendors[0].id,
      date: '2025-01-10',
      lines: [ { description: 'Test line', qty: 2, rate: 10 } ],
    }
    const res: any = await POST(makeReq('http://localhost/api/purchase-orders', { method: 'POST', body: JSON.stringify(payload) }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.purchaseOrder).toBeTruthy()
    expect(body.purchaseOrder.vendor).toBeTruthy()
    expect(body.purchaseOrder.total).toBe(20)
  })

  test('GET detail returns 404 for missing id', async () => {
    mockRBAC(true, true)
    const { GET } = await import('@/app/api/purchase-orders/[id]/route')
    const res: any = await GET(makeReq('http://localhost/api/purchase-orders/po_missing'), { params: { id: 'po_missing' } as any })
    expect(res.status).toBe(404)
  })

  test('Receive route returns bill and closes PO', async () => {
    mockRBAC(true, true)
    const { seedIfNeeded, createPurchaseOrder, db } = await import('@/mock/db')
    seedIfNeeded()
    const po = createPurchaseOrder({ vendorId: db.vendors[0].id, lines: [ { description: 'Rx', qty: 1, rate: 50 } ] })
    const { POST } = await import('@/app/api/purchase-orders/[id]/receive/route')
    const res: any = await POST(makeReq(`http://localhost/api/purchase-orders/${po.id}/receive`, { method: 'POST', body: JSON.stringify({ billNumber: 'BILL-T', billDate: '2025-02-02', terms: 'Net 15' }) }), { params: { id: po.id } as any })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.purchaseOrder.status).toBe('closed')
    expect(body.bill.number).toBe('BILL-T')
  })

  test('Close route closes PO', async () => {
    mockRBAC(true, true)
    const { seedIfNeeded, createPurchaseOrder, db } = await import('@/mock/db')
    seedIfNeeded()
    const po = createPurchaseOrder({ vendorId: db.vendors[0].id, lines: [ { description: 'Close me', qty: 2, rate: 5 } ] })
    const { POST } = await import('@/app/api/purchase-orders/[id]/close/route')
    const res: any = await POST(makeReq(`http://localhost/api/purchase-orders/${po.id}/close`, { method: 'POST' }), { params: { id: po.id } as any })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.purchaseOrder.status).toBe('closed')
  })
})
