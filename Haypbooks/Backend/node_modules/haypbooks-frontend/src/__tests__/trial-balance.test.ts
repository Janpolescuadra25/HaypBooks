import { mockApi } from '@/lib/mock-api'

describe('trial balance mock api', () => {
  it('returns balanced totals and expected shape', async () => {
    const data = await mockApi<any>('/api/reports/trial-balance?period=YTD&end=2025-01-31')
    expect(data).toHaveProperty('rows')
    expect(Array.isArray(data.rows)).toBe(true)
    expect(data).toHaveProperty('totals')
    expect(data.balanced).toBe(true)
    const totalDebit = data.rows.reduce((s: number, r: any) => s + r.debit, 0)
    const totalCredit = data.rows.reduce((s: number, r: any) => s + r.credit, 0)
    expect(totalDebit).toEqual(totalCredit)
  })
})
