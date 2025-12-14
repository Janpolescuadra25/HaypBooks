import { mockApi } from '@/lib/mock-api'

describe('Bills POST computes due date from terms', () => {
  test('POST /api/bills uses Net 15 and billDate to compute dueDate', async () => {
    const body = {
      number: 'BILL-POST-1',
      vendor: 'Vendor 1',
      billDate: '2025-01-10',
      terms: 'Net 15',
      items: [{ description: 'Supplies', amount: 100 }],
    }
    const res = await mockApi<any>('http://localhost/api/bills', { method: 'POST', body: JSON.stringify(body) })
    expect(res.bill).toBeTruthy()
    expect(res.bill.terms).toBe('Net 15')
    expect((res.bill.dueDate || '').slice(0,10)).toBe('2025-01-25')
    // billDate should be preserved
    expect((res.bill.billDate || '').slice(0,10)).toBe('2025-01-10')
  })

  test('POST /api/bills respects provided dueDate', async () => {
    const body = {
      number: 'BILL-POST-2',
      vendor: 'Vendor 2',
      billDate: '2025-01-10',
      terms: 'Net 30',
      dueDate: '2025-02-05',
      items: [{ description: 'Materials', amount: 50 }],
    }
    const res = await mockApi<any>('http://localhost/api/bills', { method: 'POST', body: JSON.stringify(body) })
    expect(res.bill).toBeTruthy()
    expect((res.bill.dueDate || '').slice(0,10)).toBe('2025-02-05')
  })
})
