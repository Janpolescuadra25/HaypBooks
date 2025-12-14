import { mockApi } from '@/lib/mock-api'

describe('Entities list mocks', () => {
  test('transactions list returns paging fields', async () => {
    const data = await mockApi<any>('/api/transactions?page=2&limit=5')
    expect(Array.isArray(data.transactions)).toBe(true)
    expect(data.page).toBe(2)
    expect(data.limit).toBe(5)
    expect(typeof data.total).toBe('number')
  })

  test('invoices list returns items', async () => {
    const data = await mockApi<any>('/api/invoices')
    expect(Array.isArray(data.invoices)).toBe(true)
    expect(typeof data.total).toBe('number')
  })

  test('bills list returns items', async () => {
    const data = await mockApi<any>('/api/bills')
    expect(Array.isArray(data.bills)).toBe(true)
    expect(typeof data.total).toBe('number')
  })
})
