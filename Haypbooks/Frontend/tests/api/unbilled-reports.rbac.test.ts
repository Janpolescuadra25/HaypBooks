import { NextRequest } from 'next/server'

// Mock RBAC to simulate a role without reports:read permission
jest.mock('@/lib/rbac', () => ({
  getRoleFromCookies: () => 'viewer',
  hasPermission: () => false,
}))

function makeReq(url: string) {
  return new NextRequest(url)
}

describe('RBAC enforcement for unbilled reports', () => {
  it('unbilled-charges returns 403 when forbidden', async () => {
    const { GET } = await import('@/app/api/reports/unbilled-charges/route')
    const req = makeReq('http://test/api/reports/unbilled-charges?end=2025-09-04')
    const res: any = await GET(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })

  it('unbilled-time returns 403 when forbidden', async () => {
    const { GET } = await import('@/app/api/reports/unbilled-time/route')
    const req = makeReq('http://test/api/reports/unbilled-time?end=2025-09-04')
    const res: any = await GET(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })
})
