import '@testing-library/jest-dom'

// Ensure a clean module registry between tests since we mock RBAC
afterEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

// Minimal integration-style checks for RBAC/CSV behaviors using route handlers directly.

describe('RBAC/CSV smoke (selected)', () => {
  it('A/R Aging Summary export requires reports:read', async () => {
    // Simulate a role without reports:read
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'guest',
      hasPermission: () => false,
    }))
    const { GET } = await import('@/app/api/reports/ar-aging/export/route')
    const req403 = new Request('http://localhost/api/reports/ar-aging/export')
    const res403 = await GET(req403)
    expect(res403.status).toBe(403)
  })

  it('Open Invoices CSV filename & caption structure', async () => {
    // Explicitly mock RBAC as admin for this test
    jest.resetModules()
    jest.doMock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'admin',
      hasPermission: () => true,
    }))
    const { GET } = await import('@/app/api/reports/open-invoices/export/route')
    const req = new Request('http://localhost/api/reports/open-invoices/export?end=2025-09-30')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    // Policy: when only end is provided, caption is the bare end date
    expect(lines[0]).toBe('2025-09-30')
    expect(lines[2]).toMatch(/Customer,Type,Number,Invoice Date,Due Date,Aging \(days\),Open Balance/)
  })
})
