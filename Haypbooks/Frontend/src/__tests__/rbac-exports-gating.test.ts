import { GET as CUSTOMERS_GET } from '@/app/api/customers/export/route'
import { GET as VENDORS_GET } from '@/app/api/vendors/export/route'
import { GET as TXN_GET } from '@/app/api/transactions/export/route'
import { GET as BP_GET } from '@/app/api/bill-payments/export/route'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string): Request { return new Request(url) }

describe('RBAC gating for CSV export routes', () => {
  afterEach(() => setRoleOverride(undefined))

  test('customers export denies when lacking customers:read', async () => {
    // Force denial by mocking hasPermission to false for this test
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => {
      const actual = jest.requireActual<any>('@/lib/rbac-server')
      return { ...actual, hasPermission: () => false }
    })
    const { GET } = await import('@/app/api/customers/export/route')
    const res: any = await GET(makeReq('http://localhost/api/customers/export'))
    expect(res.status).toBe(403)
  })

  test('customers export allows viewer (has reports:read)', async () => {
    setRoleOverride('viewer')
    const res: any = await CUSTOMERS_GET(makeReq('http://localhost/api/customers/export?end=2025-01-31'))
    expect(res.status).toBe(200)
    const cd = (res.headers?.get ? res.headers.get('Content-Disposition') : res.headers['Content-Disposition']) as string | null
    expect(cd || '').toMatch(/customers-asof-/)
  })

  test('vendors export denies when lacking vendors:read', async () => {
    jest.doMock('@/lib/rbac-server', () => {
      const actual = jest.requireActual<any>('@/lib/rbac-server')
      return { ...actual, hasPermission: () => false }
    })
    const { GET } = await import('@/app/api/vendors/export/route')
    const res: any = await GET(makeReq('http://localhost/api/vendors/export'))
    expect(res.status).toBe(403)
  })

  test('transactions export denies when lacking transactions:read', async () => {
    jest.doMock('@/lib/rbac-server', () => {
      const actual = jest.requireActual<any>('@/lib/rbac-server')
      return { ...actual, hasPermission: () => false }
    })
    const { GET } = await import('@/app/api/transactions/export/route')
    const res: any = await GET(makeReq('http://localhost/api/transactions/export'))
    expect(res.status).toBe(403)
  })

  test('bill-payments export denies when lacking bill-payments:read', async () => {
    jest.doMock('@/lib/rbac-server', () => {
      const actual = jest.requireActual<any>('@/lib/rbac-server')
      return { ...actual, hasPermission: () => false }
    })
    const { GET } = await import('@/app/api/bill-payments/export/route')
    const res: any = await GET(makeReq('http://localhost/api/bill-payments/export') as any)
    expect(res.status).toBe(403)
  })
})
