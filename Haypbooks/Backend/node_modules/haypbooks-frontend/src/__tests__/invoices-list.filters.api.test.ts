import { mockApi } from '@/lib/mock-api'

describe('Invoices list filters', () => {
  test('filters by status=paid', async () => {
    const data = await mockApi<any>('/api/invoices?status=paid&limit=50')
    expect(Array.isArray(data.invoices)).toBe(true)
    expect(data.invoices.length).toBeGreaterThan(0)
    for (const inv of data.invoices) {
      expect(inv.status).toBe('paid')
    }
  })

  test('filters by date range', async () => {
    const start = '2025-01-05'
    const end = '2025-01-12'
    const data = await mockApi<any>(`/api/invoices?start=${start}&end=${end}&limit=100`)
    for (const inv of data.invoices) {
      const d = String(inv.date).slice(0,10)
      expect(d >= start).toBe(true)
      expect(d <= end).toBe(true)
    }
  })

  test('applies paging after filtering', async () => {
    const page1 = await mockApi<any>('/api/invoices?status=sent&limit=5&page=1')
    const page2 = await mockApi<any>('/api/invoices?status=sent&limit=5&page=2')
    expect(page1.page).toBe(1)
    expect(page2.page).toBe(2)
    expect(page1.limit).toBe(5)
    expect(page2.limit).toBe(5)
    expect(page1.total).toBe(page2.total)
    const ids1 = new Set(page1.invoices.map((i: any) => i.id))
    for (const inv of page2.invoices) {
      expect(ids1.has(inv.id)).toBe(false)
      expect(inv.status).toBe('sent')
    }
  })
})
