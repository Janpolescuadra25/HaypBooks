import { GET as GET_AR } from '@/app/api/reports/ar-aging-detail/route'
import { GET as GET_AP } from '@/app/api/reports/ap-aging-detail/route'

const makeReq = (url: string) => new Request(url)

describe('Aging Detail APIs (AR/AP)', () => {
  test('AR aging detail returns rows, totals, and metadata', async () => {
    const res: any = await GET_AR(makeReq('http://localhost/api/reports/ar-aging-detail?end=2025-09-04'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.rows)).toBe(true)
    expect(data.rows.length).toBeGreaterThan(0)
    // totals
    const computed = data.rows.reduce((s: number, r: any) => s + r.openBalance, 0)
    expect(Number(data.totals.openBalance.toFixed(2))).toBe(Number(computed.toFixed(2)))
    // metadata
    expect(data.asOf).toBe('2025-09-04')
    expect(data.start).toBeNull()
    expect(data.end).toBe('2025-09-04')
    expect([null, 'Today','Yesterday','ThisWeek','LastWeek','Last2Weeks','ThisMonth','LastMonth','Last30','MTD','ThisQuarter','LastQuarter','QTD','ThisYear','LastYear','YTD','YearToLastMonth','Last12'])
      .toContain(data.period)
    // rows shape
    const r = data.rows[0]
    expect(r).toHaveProperty('customer')
    expect(r).toHaveProperty('type')
    expect(r).toHaveProperty('number')
    expect(r).toHaveProperty('invoiceDate')
    expect(r).toHaveProperty('dueDate')
    expect(r).toHaveProperty('aging')
    expect(r).toHaveProperty('openBalance')
  })

  test('AP aging detail returns rows, totals, and metadata', async () => {
    const res: any = await GET_AP(makeReq('http://localhost/api/reports/ap-aging-detail?end=2025-09-04'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.rows)).toBe(true)
    expect(data.rows.length).toBeGreaterThan(0)
    const computed = data.rows.reduce((s: number, r: any) => s + r.openBalance, 0)
    expect(Number(data.totals.openBalance.toFixed(2))).toBe(Number(computed.toFixed(2)))
    expect(data.asOf).toBe('2025-09-04')
    expect(data.start).toBeNull()
    expect(data.end).toBe('2025-09-04')
    expect([null, 'Today','Yesterday','ThisWeek','LastWeek','Last2Weeks','ThisMonth','LastMonth','Last30','MTD','ThisQuarter','LastQuarter','QTD','ThisYear','LastYear','YTD','YearToLastMonth','Last12'])
      .toContain(data.period)
    const r = data.rows[0]
    expect(r).toHaveProperty('vendor')
    expect(r).toHaveProperty('type')
    expect(r).toHaveProperty('number')
    expect(r).toHaveProperty('billDate')
    expect(r).toHaveProperty('dueDate')
    expect(r).toHaveProperty('aging')
    expect(r).toHaveProperty('openBalance')
  })

  test('AR aging detail respects start/end range', async () => {
    const res: any = await GET_AR(makeReq('http://localhost/api/reports/ar-aging-detail?start=2025-08-01&end=2025-09-04'))
    const data = await res.json()
    for (const r of data.rows) {
      expect(r.invoiceDate >= '2025-08-01' && r.invoiceDate <= '2025-09-04').toBe(true)
      expect(r.dueDate <= data.asOf).toBe(true)
    }
  })

  test('AP aging detail respects start/end range', async () => {
    const res: any = await GET_AP(makeReq('http://localhost/api/reports/ap-aging-detail?start=2025-08-01&end=2025-09-04'))
    const data = await res.json()
    for (const r of data.rows) {
      expect(r.billDate >= '2025-08-01' && r.billDate <= '2025-09-04').toBe(true)
      expect(r.dueDate <= data.asOf).toBe(true)
    }
  })

  test('RBAC: forbidden when role has no reports:read', async () => {
    // Simulate getRoleFromCookies to return a role not defined (falls back handled in code), so instead
    // we temporarily mock the helper to return a made-up role with no permissions
    jest.resetModules()
    jest.mock('@/lib/rbac-server', () => ({
      getRoleFromCookies: () => 'nope',
      hasPermission: (_role: any, _perm: any) => false,
    }))
    const { GET: GET_AR2 } = await import('@/app/api/reports/ar-aging-detail/route')
    const res: any = await GET_AR2(makeReq('http://localhost/api/reports/ar-aging-detail'))
    expect(res.status).toBe(403)

    const { GET: GET_AP2 } = await import('@/app/api/reports/ap-aging-detail/route')
    const res2: any = await GET_AP2(makeReq('http://localhost/api/reports/ap-aging-detail'))
    expect(res2.status).toBe(403)
  })
})
