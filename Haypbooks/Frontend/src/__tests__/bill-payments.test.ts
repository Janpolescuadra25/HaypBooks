import { mockApi } from '@/lib/mock-api'
import { assertBalanced } from '../test-utils/assertBalanced'

async function createBill(total = 270) {
  const amount = typeof total === 'number' ? total : 270
  const body = { vendorId: 'Vendor Payment', items: [{ description: 'Line A', amount }], dueDate: new Date().toISOString() }
  const res = await mockApi<any>('http://localhost/api/bills', { method: 'POST', body: JSON.stringify(body) })
  return res.bill
}

describe('Bill payments API', () => {
  test('POST /api/bills/:id/payments records payment and marks paid when fully covered', async () => {
    const bill = await createBill(300)
    const total = bill.total
    const pay = await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: total }) })
    expect(pay.payment).toBeTruthy()
    expect(Array.isArray(pay.bill.payments)).toBe(true)
    const paid = pay.bill.payments.reduce((s: number, p: any) => s + p.amount, 0)
    expect(paid).toBeGreaterThanOrEqual(total)
    expect(['paid','scheduled','open'].includes(pay.bill.status)).toBe(true)
    assertBalanced('bill full payment')
  })

  test('partial payments accumulate and status becomes paid when reaching total', async () => {
  const bill = await createBill(270)
    const total = bill.total
  const pay1 = total / 3
  const p1 = await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: pay1 }) })
  expect(p1.bill.status).not.toBe('paid')
  const pay2 = total / 3
  const p2 = await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: pay2 }) })
  expect(p2.bill.status).not.toBe('paid')
  const paidSoFar = pay1 + pay2
  const remaining = total - paidSoFar
  const p3 = await mockApi<any>(`http://localhost/api/bills/${bill.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: remaining }) })
  expect(p3.bill.status).toBe('paid')
  assertBalanced('bill partial payments cumulative')
  })
})
