import { mockApi } from '@/lib/mock-api'

describe('Aging reports mock', () => {
  test('AR Aging returns rows and totals that sum', async () => {
    const data = await mockApi<any>('/api/reports/ar-aging?period=YTD')
    expect(Array.isArray(data.rows)).toBe(true)
    const sum = data.rows.reduce((s: number, r: any) => s + r.total, 0)
    expect(sum).toBe(data.totals.total)
  })

  test('AP Aging returns rows and totals that sum', async () => {
    const data = await mockApi<any>('/api/reports/ap-aging?period=YTD')
    expect(Array.isArray(data.rows)).toBe(true)
    const sum = data.rows.reduce((s: number, r: any) => s + r.total, 0)
    expect(sum).toBe(data.totals.total)
  })
})
