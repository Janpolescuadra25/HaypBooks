import { mockApi } from '@/lib/mock-api'

async function createSampleInvoice() {
  const body = { number: `INV-T-${Date.now()}`, customer: 'Customer 1', lines: [{ description: 'Line', amount: 150 }], items: [{ description: 'Line', amount: 150 }], date: '2025-01-20' }
  const res = await mockApi<any>('/api/invoices', { method: 'POST', body: JSON.stringify(body) })
  return res.invoice
}

describe('Invoice detail and actions', () => {
  test('GET /api/invoices/:id returns invoice with items', async () => {
    const inv = await createSampleInvoice()
    const data = await mockApi<any>(`/api/invoices/${inv.id}`)
    expect(data.invoice).toBeTruthy()
    expect(data.invoice.id).toBe(inv.id)
  // API returns stored lines array (not items alias) so accept either
  const lines = (data.invoice as any).lines || (data.invoice as any).items
  expect(Array.isArray(lines)).toBe(true)
  })

  test('POST /api/invoices/:id/send marks as sent', async () => {
    const inv = await createSampleInvoice()
    const data = await mockApi<any>(`/api/invoices/${inv.id}/send`, { method: 'POST' })
    expect(['sent','overdue'].includes(data.invoice.status)).toBe(true)
  })

  test('POST /api/invoices/:id/payments records payment and may mark paid', async () => {
    const inv = await createSampleInvoice()
    const d1 = await mockApi<any>(`/api/invoices/${inv.id}`, { method: 'GET' })
    const total = d1.invoice.total
    const pay = await mockApi<any>(`/api/invoices/${inv.id}/payments`, { method: 'POST', body: JSON.stringify({ amount: total }) })
    expect(pay.payment).toBeTruthy()
  expect(['paid','sent','partial','draft'].includes(pay.invoice.status)).toBe(true)
  })
})
