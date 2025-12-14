import { mockApi } from '@/lib/mock-api'

describe('Profit & Loss mock', () => {
  test('returns lines and totals and net income math checks out', async () => {
    const data = await mockApi<any>('/api/reports/profit-loss?period=YTD')
    expect(data).toBeTruthy()
    expect(Array.isArray(data.lines)).toBe(true)
    const t = data.totals
    expect(typeof t.netIncome).toBe('number')
    expect(t.grossProfit).toBe(t.revenue - t.cogs)
    expect(t.operatingIncome).toBe(t.grossProfit - t.expenses)
    expect(t.netIncome).toBe(t.operatingIncome + t.otherIncome)
  })

  test('compare adds prevTotals', async () => {
    const data = await mockApi<any>('/api/reports/profit-loss?period=YTD&compare=1')
    expect(data.prevTotals).toBeTruthy()
  })
})
