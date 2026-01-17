import { mockServerRBAC } from './rbac/helpers'

describe('Export routes: 403 is plaintext Forbidden', () => {
  beforeEach(() => {
    jest.resetModules()
    const { setRole } = mockServerRBAC()
    // Force a role with no permissions to simulate denial
    setRole('viewer')
    // And also patch hasPermission to return false just in case
    jest.doMock('@/lib/rbac-server', () => {
      const actual = jest.requireActual<any>('@/lib/rbac-server')
      return {
        ...actual,
        hasPermission: () => false,
      }
    })
  })

  test('account-ledger export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/account-ledger/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/account-ledger/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('sales-by-customer-summary export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/sales-by-customer-summary/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/sales-by-customer-summary/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('transaction-detail-by-account export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/transaction-detail-by-account/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/transaction-detail-by-account/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('profit-loss export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/profit-loss/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/profit-loss/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('balance-sheet export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/balance-sheet/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/balance-sheet/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('cash-flow export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/cash-flow/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/cash-flow/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('profit-loss-by-month export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/profit-loss-by-month/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/profit-loss-by-month/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('profit-loss-by-quarter export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/profit-loss-by-quarter/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/profit-loss-by-quarter/export'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })

  test('management pack export returns text/plain 403 Forbidden', async () => {
    const { GET } = await import('@/app/api/reports/pack/export/route')
    const res: any = await GET(new Request('http://localhost/api/reports/pack/export?preset=YTD&reports=profit-and-loss,balance-sheet'))
    expect(res.status).toBe(403)
    const text = await res.text()
    // Support both legacy plain text and JSON error bodies
    try {
      const parsed = JSON.parse(text)
      expect(parsed.error).toBe('Forbidden')
    } catch (e) {
      expect(text).toBe('Forbidden')
    }
  })
})
