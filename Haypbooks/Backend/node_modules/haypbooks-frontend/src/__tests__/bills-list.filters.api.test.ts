import { mockApi } from '@/lib/mock-api'

describe('Bills list filters', () => {
  test('filters by status=paid', async () => {
    const data = await mockApi<any>('/api/bills?status=paid&limit=100')
    expect(Array.isArray(data.bills)).toBe(true)
    expect(data.bills.length).toBeGreaterThan(0)
    for (const b of data.bills) {
      expect(b.status).toBe('paid')
    }
  })

  test('filters by date range', async () => {
    const start = '2025-01-05'
    const end = '2025-01-12'
    const data = await mockApi<any>(`/api/bills?start=${start}&end=${end}&limit=200`)
    for (const b of data.bills) {
      const d = String(b.dueDate).slice(0,10)
      expect(d >= start).toBe(true)
      expect(d <= end).toBe(true)
    }
  })

  test('applies paging after filtering', async () => {
    const page1 = await mockApi<any>('/api/bills?status=open&limit=5&page=1')
    const page2 = await mockApi<any>('/api/bills?status=open&limit=5&page=2')
    expect(page1.page).toBe(1)
    expect(page2.page).toBe(2)
    expect(page1.limit).toBe(5)
    expect(page2.limit).toBe(5)
    expect(page1.total).toBe(page2.total)
    const ids1 = new Set(page1.bills.map((b: any) => b.id))
    for (const b of page2.bills) {
      expect(ids1.has(b.id)).toBe(false)
      expect(b.status).toBe('open')
    }
  })
})
