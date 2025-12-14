import { setRoleOverride } from '@/lib/rbac-server'
import { POST as Create } from '@/app/api/receipts/route'
import { POST as MatchId } from '@/app/api/receipts/[id]/match/route'
import { GET as Linked } from '@/app/api/receipts/[id]/linked/route'
import { upsertInvoice } from '@/app/api/invoices/store'
import { upsertBill } from '@/app/api/bills/store'

// API tests for linked preview endpoint: /api/receipts/:id/linked
// Covers success (invoice), success (bill), 409 when receipt not matched, and 404 missing receipt.
// Brand-neutral; validates response shape fields needed by UI modal.

describe('receipts linked preview API', () => {
  beforeEach(() => { setRoleOverride('admin') })
  afterEach(() => { setRoleOverride(undefined as any) })

  async function createReceipt(data: any) {
    const res: any = await Create(new Request('http://test/api/receipts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) }) as any)
    const json = await res.json()
    return json.receipt.id as string
  }

  test('returns 409 when receipt not matched', async () => {
    const id = await createReceipt({ vendor: 'Unmatched Co', amount: 12.34 })
    const res: any = await Linked(new Request(`http://test/api/receipts/${id}/linked`) as any, { params: { id } })
    expect(res.status).toBe(409)
  })

  test('returns 404 when receipt missing', async () => {
    const res: any = await Linked(new Request('http://test/api/receipts/nope/linked') as any, { params: { id: 'nope' } })
    expect(res.status).toBe(404)
  })

  test('invoice match preview gives expected shape', async () => {
    // Seed invoice
    upsertInvoice({ id: 'inv-1', number: 'INV-001', customer: 'Alpha LLC', status: 'sent', total: 55.10, date: '2025-01-02', items: [{ description: 'Item', amount: 55.10 }], payments: [] })
    const id = await createReceipt({ vendor: 'Alpha', amount: 55.10 })
    // Match receipt to invoice
    const matchRes: any = await MatchId(new Request(`http://test/api/receipts/${id}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'inv-1' }) }) as any, { params: { id } })
    expect(matchRes.status).toBe(200)
    const res: any = await Linked(new Request(`http://test/api/receipts/${id}/linked`) as any, { params: { id } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.linked).toMatchObject({ type: 'invoice', id: 'inv-1', number: 'INV-001', amountOriginal: 55.10 })
    expect(typeof json.linked.amountOpen).toBe('number')
    expect(json.linked.lineCount).toBe(1)
  })

  test('bill match preview gives expected shape', async () => {
    upsertBill({ id: 'bill-1', number: 'BILL-001', vendor: 'VendorCo', status: 'open', total: 40, dueDate: '2025-02-10', items: [{ description: 'Service', amount: 40 }], payments: [] })
    const id = await createReceipt({ vendor: 'VendorCo', amount: 40 })
    const matchRes: any = await MatchId(new Request(`http://test/api/receipts/${id}/match`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transactionId: 'bill-1' }) }) as any, { params: { id } })
    expect(matchRes.status).toBe(200)
    const res: any = await Linked(new Request(`http://test/api/receipts/${id}/linked`) as any, { params: { id } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.linked).toMatchObject({ type: 'bill', id: 'bill-1', number: 'BILL-001', amountOriginal: 40 })
    expect(json.linked.lineCount).toBe(1)
  })
})
