import { mockApi } from '@/lib/mock-api'
import { assertBalanced } from '../test-utils/assertBalanced'

async function createBill() {
  const body = { vendorId: 'Vendor Auto', items: [{ description: 'Service', amount: 100 }], dueDate: new Date().toISOString() }
  const res = await mockApi<any>('http://localhost/api/bills', { method: 'POST', body: JSON.stringify(body) })
  return res.bill
}

describe('Bill approval workflow', () => {
  test('submit sets status pending_approval', async () => {
    const bill = await createBill()
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'submit' }) })
    expect(res.bill.status).toBe('pending_approval')
    expect(res.bill.approval?.status).toBe('pending')
    assertBalanced('bill submit approval')
  })

  test('approve sets status approved with approver info', async () => {
    const bill = await createBill()
    // first submit then approve to reflect realistic flow
    await mockApi<any>(`http://localhost/api/bills/${bill.id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'submit' }) })
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'approve' }) })
    expect(res.bill.status).toBe('approved')
    expect(res.bill.approval?.status).toBe('approved')
    expect(res.bill.approval?.by).toBeTruthy()
    expect(res.bill.approval?.at).toBeTruthy()
    assertBalanced('bill approve')
  })

  test('reject sets status rejected with note', async () => {
    const bill = await createBill()
    await mockApi<any>(`http://localhost/api/bills/${bill.id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'submit' }) })
    const res = await mockApi<any>(`http://localhost/api/bills/${bill.id}/approval`, { method: 'POST', body: JSON.stringify({ action: 'reject', note: 'Incorrect total' }) })
    expect(res.bill.status).toBe('rejected')
    expect(res.bill.approval?.status).toBe('rejected')
    expect(res.bill.approval?.note).toContain('Incorrect total')
    assertBalanced('bill reject')
  })
})
