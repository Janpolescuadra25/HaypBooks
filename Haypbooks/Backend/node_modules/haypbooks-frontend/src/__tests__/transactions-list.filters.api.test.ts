import { mockApi } from '@/lib/mock-api'
import { GET as TXN_EXPORT_GET } from '@/app/api/transactions/export/route'

function makeReq(url: string): Request { return new Request(url) }

describe('Transactions list filtering and export', () => {
  test('filters by type=Income', async () => {
    const data = await mockApi<any>('/api/transactions?type=Income&limit=100')
    expect(Array.isArray(data.transactions)).toBe(true)
    expect(data.transactions.length).toBeGreaterThan(0)
    for (const t of data.transactions) {
      expect(t.category).toBe('Income')
    }
  })

  test('filters by date range start/end', async () => {
    const start = '2025-01-10'
    const end = '2025-01-15'
    const data = await mockApi<any>(`/api/transactions?start=${start}&end=${end}&limit=200`)
    for (const t of data.transactions) {
      const d = String(t.date).slice(0,10)
      expect(d >= start).toBe(true)
      expect(d <= end).toBe(true)
    }
  })

  test('applies paging after filtering', async () => {
    const page1 = await mockApi<any>('/api/transactions?type=Expense&limit=5&page=1')
    const page2 = await mockApi<any>('/api/transactions?type=Expense&limit=5&page=2')
    expect(page1.page).toBe(1)
    expect(page2.page).toBe(2)
    expect(page1.limit).toBe(5)
    expect(page2.limit).toBe(5)
    expect(page1.total).toBe(page2.total)
    // ensure no overlap by id between pages (synthetic ids are unique and ordered)
    const ids1 = new Set(page1.transactions.map((t: any) => t.id))
    for (const t of page2.transactions) {
      expect(ids1.has(t.id)).toBe(false)
      expect(t.category).toBe('Expense')
    }
  })

  test('export route filters by type', async () => {
    const url = 'http://localhost/api/transactions/export?type=Income'
    const res = await TXN_EXPORT_GET(makeReq(url))
    const body = await (res as any).text()
    const lines = body.trim().split('\n')
    // Skip header lines (first two lines)
    const dataLines = lines.slice(2)
    for (const line of dataLines) {
      const cols = line.split(',')
      // Date, Description, Category, Amount, Account
      expect(cols[2]).toBe('Income')
    }
  })
})
