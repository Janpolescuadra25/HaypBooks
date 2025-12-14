import { mockApi } from '@/lib/mock-api'
import { assertBalanced } from '../test-utils/assertBalanced'

async function createBill(overrides: any = {}) {
  const body = { vendorId: 'Vendor Flow', items: [{ description: 'Item', amount: 5 }], dueDate: new Date().toISOString(), ...overrides }
  const res = await mockApi<any>('http://localhost/api/bills', { method: 'POST', body: JSON.stringify(body) })
  return res.bill
}

describe('Bills update/delete and schedule flows', () => {
  test('PUT /api/bills/:id updates bill with items and vendor', async () => {
    const bill = await createBill()
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}`, {
      method: 'PUT',
      body: JSON.stringify({ number: 'BILL-7777', vendorId: 'ven_1', items: [{ description: 'x', amount: 10 }, { description: 'y', amount: 15 }], dueDate: '2025-02-01' })
    })
    expect(res.bill).toBeTruthy()
    expect(res.bill.number).toBe('BILL-7777')
  expect(res.bill.vendor).toBeTruthy()
    expect(res.bill.total).toBe(25)
    assertBalanced('bill update items')
  })

  test('DELETE /api/bills/:id returns ok true', async () => {
    const bill = await createBill()
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}`, { method: 'DELETE' })
    expect(res.ok).toBe(true)
    assertBalanced('bill delete')
  })

  test('POST /api/bills/:id/schedule sets scheduledDate and status scheduled', async () => {
    const bill = await createBill()
    const date = '2025-02-15T00:00:00.000Z'
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}/schedule`, { method: 'POST', body: JSON.stringify({ date }) })
    expect(res.bill.status).toBe('scheduled')
    expect(res.bill.scheduledDate).toBe(date)
    assertBalanced('bill schedule set')
  })

  test('DELETE /api/bills/:id/schedule clears scheduledDate and sets status open', async () => {
    const bill = await createBill()
    // schedule first
    const date = '2025-03-01T00:00:00.000Z'
    await mockApi<any>(`http://localhost/api/bills/${bill.id}/schedule`, { method: 'POST', body: JSON.stringify({ date }) })
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}/schedule`, { method: 'DELETE' })
    expect(res.bill.status).toBe('open')
    expect(res.bill.scheduledDate === null || res.bill.scheduledDate === undefined).toBe(true)
    assertBalanced('bill schedule clear')
  })
})
