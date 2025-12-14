import { mockApi } from '@/lib/mock-api'

// Basic tests for bankStatus lifecycle
// NOTE: This is a lightweight test; more comprehensive UI tests can be added later.
describe('Bank Transactions bankStatus transitions', () => {
  test('can create transaction with default status and categorize it', async () => {
    const created = await mockApi<any>('/api/transactions', { method: 'POST', body: JSON.stringify({ date: '2025-01-15', description: 'Bank Feed Txn', category: 'Income', amount: 123.45 }) })
    expect(created.transaction).toBeTruthy()
    expect(created.transaction.bankStatus).toBe('for_review')
    const updated = await mockApi<any>('/api/transactions', { method: 'PUT', body: JSON.stringify({ ...created.transaction, bankStatus: 'categorized' }) })
    expect(updated.transaction.bankStatus).toBe('categorized')
  })

  test('list filter by bankStatus returns only matching', async () => {
    const listAll = await mockApi<any>('/api/transactions?page=1&limit=100')
    const filtered = await mockApi<any>('/api/transactions?page=1&limit=100&bankStatus=categorized')
    expect(filtered.transactions.length).toBeGreaterThan(0)
    expect(filtered.transactions.every((t: any) => t.bankStatus === 'categorized')).toBe(true)
  })
})
