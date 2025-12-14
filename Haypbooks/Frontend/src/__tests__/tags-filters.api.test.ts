import { mockApi } from '@/lib/mock-api'

describe('Tag filters', () => {
  test('invoices list supports tag filter', async () => {
    const catalog = await mockApi<any>('/api/tags')
    const anyTag: string | undefined = catalog?.tags?.[0]?.id
    expect(anyTag).toBeTruthy()
    if (!anyTag) return
    const data = await mockApi<any>(`/api/invoices?tag=${encodeURIComponent(anyTag)}&limit=200`)
    expect(Array.isArray(data.invoices)).toBe(true)
    for (const row of data.invoices) {
      // mapped rows omit tags; fetch full invoice to assert assignment
      const detail = await mockApi<any>(`/api/invoices/${row.id}`)
      expect(Array.isArray(detail.invoice.tags)).toBe(true)
      expect(detail.invoice.tags).toContain(anyTag)
    }
  })

  test('bills list supports tag filter', async () => {
    const catalog = await mockApi<any>('/api/tags')
    const anyTag: string | undefined = catalog?.tags?.[1]?.id
    expect(anyTag).toBeTruthy()
    if (!anyTag) return
    const data = await mockApi<any>(`/api/bills?tag=${encodeURIComponent(anyTag)}&limit=200`)
    expect(Array.isArray(data.bills)).toBe(true)
    // bills list is mapped; verify via detail
    for (const row of data.bills) {
      const detail = await mockApi<any>(`/api/bills/${row.id}`)
      expect(Array.isArray(detail.bill.tags)).toBe(true)
      expect(detail.bill.tags).toContain(anyTag)
    }
  })

  test('transactions list supports tag filter', async () => {
    const catalog = await mockApi<any>('/api/tags')
    const anyTag: string | undefined = catalog?.tags?.find((t: any) => t.group === 'Region')?.id || catalog?.tags?.[0]?.id
    expect(anyTag).toBeTruthy()
    if (!anyTag) return
    const data = await mockApi<any>(`/api/transactions?tag=${encodeURIComponent(anyTag)}&limit=200`)
    expect(Array.isArray(data.transactions)).toBe(true)
    for (const t of data.transactions) {
      expect(Array.isArray(t.tags)).toBe(true)
      expect(t.tags).toContain(anyTag)
    }
  })
})
