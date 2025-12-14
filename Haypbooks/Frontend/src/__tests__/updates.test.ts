import { mockApi } from '@/lib/mock-api'

describe('Update/Delete endpoints', () => {
  it('updates a transaction via PUT', async () => {
    // Create first to ensure the store has something predictable
    const created = await mockApi<{ transaction: any }>('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ date: new Date().toISOString(), description: 'Original', category: 'Income', amount: 10, accountId: 'acc_1' })
    })
    const upd = await mockApi<{ transaction: any }>('http://localhost/api/transactions', {
      method: 'PUT',
      body: JSON.stringify({ ...created.transaction, description: 'Updated' })
    })
    expect(upd.transaction.description).toBe('Updated')
  })

  it('deletes a transaction via DELETE', async () => {
    const c = await mockApi<{ transaction: any }>('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ date: new Date().toISOString(), description: 'Temp', category: 'Expense', amount: 5, accountId: 'acc_1' })
    })
    const del = await mockApi<{ ok: boolean }>(`http://localhost/api/transactions?id=${encodeURIComponent(c.transaction.id)}`, { method: 'DELETE' })
    expect(del.ok).toBe(true)
  })

  it('updates an invoice via PUT and soft-deletes via DELETE', async () => {
    // Create invoice first
    const created = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify({ number: 'INV-DELTA', customer: 'Customer 1', lines: [{ description: 'A', amount: 5 }], items: [{ description: 'A', amount: 5 }] }) })
    const id = created.invoice.id
    const upd = await mockApi<any>(`http://localhost/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ number: created.invoice.number, customer: 'Customer 2', items: [{ description: 'x', amount: 1 }] })
    })
    expect(upd.invoice.customer).toBeTruthy()
    const del = await mockApi<any>(`http://localhost/api/invoices/${id}`, { method: 'DELETE' })
    expect(del.ok).toBe(true)
  })
})
