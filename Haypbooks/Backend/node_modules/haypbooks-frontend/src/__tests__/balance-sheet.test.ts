import { mockApi } from '@/lib/mock-api'

describe('Balance Sheet mock', () => {
  test('balances: assets = liabilities + equity', async () => {
    const data = await mockApi<any>('/api/reports/balance-sheet?period=YTD')
    expect(data.balanced).toBe(true)
    expect(data.totals.assets).toBe(data.totals.liabilities + data.totals.equity)
  })

  test('compare includes prev totals', async () => {
    const data = await mockApi<any>('/api/reports/balance-sheet?period=YTD&compare=1')
    expect(data.prev).toBeTruthy()
    expect(typeof data.prev.totals.assets).toBe('number')
  })
})
