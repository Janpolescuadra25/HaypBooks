export {}
const makeReq = (url: string, init?: RequestInit) => new Request(url, init)

// Simple RBAC mock switcher
const mockRBAC = (canWrite: boolean) => {
  jest.doMock('@/lib/rbac-server', () => ({
    getRoleFromCookies: () => (canWrite ? 'admin' : 'viewer'),
    hasPermission: (_role: string, perm: string) => {
      if (perm === 'bills:write') return canWrite
      return false
    },
  }))
}

describe('POST /api/checks/print', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('denies without bills:write', async () => {
    mockRBAC(false)
    const { POST } = await import('@/app/api/checks/print/route')
    const res: any = await POST(makeReq('http://localhost/api/checks/print', { method: 'POST', body: JSON.stringify({}) }))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden' })
  })

  test('returns PDF with standardized filename', async () => {
    mockRBAC(true)
    const { POST } = await import('@/app/api/checks/print/route')
    const asOfIso = '2025-10-04'
    const account = 'Operating Checking - 1234'
    const res: any = await POST(
      makeReq('http://localhost/api/checks/print', {
        method: 'POST',
        body: JSON.stringify({ asOfIso, account }),
      })
    )
    expect(res.status).toBe(200)
    const ct = res.headers.get('Content-Type')
    const cd = res.headers.get('Content-Disposition')
    expect(ct).toBe('application/pdf')
    expect(cd).toContain('attachment; filename=')
    // Filename should follow checks-asof-<date>_operating-checking-1234.pdf
    expect(cd).toContain('checks-asof-2025-10-04_operating-checking-1234.pdf')
  })
})
