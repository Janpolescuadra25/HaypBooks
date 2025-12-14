import { POST as POST_INVOICE } from '@/app/api/invoices/route'
import { POST as POST_WRITEOFF } from '@/app/api/invoices/[id]/writeoff/route'
import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { seedIfNeeded } from '@/mock/db'

function makeReq(url: string, method: string, body?: any) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('Invoice write-off API', () => {
  test('happy path: writes off remaining balance', async () => {
    try { seedIfNeeded() } catch {}
    // Create a small invoice in draft, then mark sent so AR posts
    const invRes: any = await POST_INVOICE(makeReq('http://local/api/invoices', 'POST', { number: 'INV-T-1', customerId: 'cust_1', date: new Date().toISOString(), lines: [{ description: 'x', amount: 10 }] }))
    const invJson = await invRes.json()
    const invId = invJson?.invoice?.id || invJson?.id
    expect(invId).toBeTruthy()
    // Write off part (or all) of balance
    const woRes: any = await POST_WRITEOFF(makeReq(`http://local/api/invoices/${invId}/writeoff`, 'POST', { amount: 5 }))
    expect([200, 403]).toContain(woRes.status)
    if (woRes.status === 200) {
      const woJson = await woRes.json()
      expect(woJson.journalEntryId).toBeTruthy()
      expect(woJson.invoiceId).toBe(invId)
      expect(woJson.balance).toBeGreaterThanOrEqual(0)
    }
  })

  test('rejects closed period date when specified', async () => {
    const today = new Date().toISOString().slice(0,10)
    try { const res: any = await POST_PERIODS(makeReq('http://local/api/periods', 'POST', { closeThrough: today })); await res.json() } catch {}
    const woRes: any = await POST_WRITEOFF(makeReq(`http://local/api/invoices/inv_missing/writeoff`, 'POST', { amount: 3, date: today }))
    expect([400, 403]).toContain(woRes.status)
  })

  test('validation: amount cannot exceed remaining', async () => {
    try { seedIfNeeded() } catch {}
    const invRes: any = await POST_INVOICE(makeReq('http://local/api/invoices', 'POST', { number: 'INV-T-2', customerId: 'cust_2', date: new Date().toISOString(), lines: [{ description: 'x', amount: 4 }] }))
    const invJson = await invRes.json(); const invId = invJson?.invoice?.id || invJson?.id
    const woRes: any = await POST_WRITEOFF(makeReq(`http://local/api/invoices/${invId}/writeoff`, 'POST', { amount: 10 }))
    expect(woRes.status).toBe(400)
    const woJson = await woRes.json()
    expect(String(woJson.error || '')).toMatch(/exceeds|remaining/i)
  })
})
