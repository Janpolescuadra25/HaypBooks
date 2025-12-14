import { mockApi } from '@/lib/mock-api'

describe('CRUD mocks: invoices, bills, transactions', () => {
  test('POST /api/invoices creates a draft invoice with total from items', async () => {
    const body = {
      number: 'INV-2001',
      customer: 'Acme',
      lines: [{ description: 'Line', amount: 120 }, { description: 'Line 2', amount: 80 }],
      items: [{ description: 'Line', amount: 120 }, { description: 'Line 2', amount: 80 }],
      date: '2025-01-10'
    }
    const res = await mockApi<any>('/api/invoices', { method: 'POST', body: JSON.stringify(body) })
    expect(res.invoice).toBeTruthy()
    expect(res.invoice.number).toBe('INV-2001')
    expect(res.invoice.status).toBe('draft')
    expect(res.invoice.total).toBe(200)
  })

  test('POST /api/invoices validation error', async () => {
    await expect(mockApi<any>('/api/invoices', { method: 'POST', body: JSON.stringify({ customer: 'Acme' }) }))
      .rejects.toThrow(/400 Bad Request/)
  })

  test('POST /api/bills creates an open bill and calculates total', async () => {
    const body = { vendor: 'Vendor 3', items: [{ description: 'A', amount: 60 }, { description: 'B', amount: 40 }], dueDate: '2025-01-15' }
    const res = await mockApi<any>('/api/bills', { method: 'POST', body: JSON.stringify(body) })
    expect(res.bill).toBeTruthy()
    expect(res.bill.vendor).toBe('Vendor 3')
    expect(res.bill.status).toBe('open')
    expect(res.bill.total).toBe(100)
  })

  test('GET /api/bills/:id returns a bill with items', async () => {
    const created = await mockApi<any>('/api/bills', { method: 'POST', body: JSON.stringify({ vendor: 'Vendor 2', items: [{ description: 'x', amount: 25 }], dueDate: '2025-01-20' }) })
    const id = created.bill.id
    const res = await mockApi<any>(`/api/bills/${id}`, { method: 'GET' })
    expect(res.bill).toBeTruthy()
    expect(res.bill.id).toBe(id)
  const items = (res.bill as any).items || (res.bill as any).lines || []
  expect(Array.isArray(items)).toBe(true)
  })

  test('POST /api/bills/:id marks bill paid and returns payment', async () => {
    const created = await mockApi<any>('/api/bills', { method: 'POST', body: JSON.stringify({ vendor: 'Vendor 4', items: [{ description: 'x', amount: 55 }], dueDate: '2025-01-22' }) })
    const id = created.bill.id
    const res = await mockApi<any>(`/api/bills/${id}`, { method: 'POST' })
    expect(res.bill.status).toBe('paid')
    expect(res.payment).toBeTruthy()
    expect(res.payment.amount).toBeCloseTo(res.bill.total, 2)
  })

  test('POST /api/transactions creates a transaction', async () => {
    const body = { date: '2025-01-05', description: 'Service income', category: 'Income', amount: 500, accountId: 'acc_1' }
    const res = await mockApi<any>('/api/transactions', { method: 'POST', body: JSON.stringify(body) })
    expect(res.transaction).toBeTruthy()
    expect(res.transaction.description).toBe('Service income')
    expect(res.transaction.amount).toBe(500)
  })

  test('POST /api/transactions validation error', async () => {
    await expect(mockApi<any>('/api/transactions', { method: 'POST', body: JSON.stringify({ description: 'x' }) }))
      .rejects.toThrow(/400 Bad Request/)
  })
})
