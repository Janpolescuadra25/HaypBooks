import { mockApi } from '@/lib/mock-api'

describe('Invoices POST computes due date from terms', () => {
  test('POST /api/invoices uses Net 15 to compute dueDate', async () => {
    const body = {
      number: 'INV-POST-1',
      customer: 'Customer 1',
      date: '2025-01-10',
      terms: 'Net 15',
      items: [{ description: 'Services', amount: 100 }],
    }
    const res = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify(body) })
    expect(res.invoice).toBeTruthy()
    expect(res.invoice.terms).toBe('Net 15')
    expect((res.invoice.dueDate || '').slice(0,10)).toBe('2025-01-25')
  })

  test('POST /api/invoices respects provided dueDate', async () => {
    const body = {
      number: 'INV-POST-2',
      customer: 'Customer 2',
      date: '2025-01-10',
      terms: 'Net 30',
      dueDate: '2025-02-05',
      items: [{ description: 'Materials', amount: 50 }],
    }
    const res = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify(body) })
    expect(res.invoice).toBeTruthy()
    expect((res.invoice.dueDate || '').slice(0,10)).toBe('2025-02-05')
  })
})
