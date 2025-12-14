import { GET as GET_ROUTE, POST as POST_ROUTE } from '@/app/api/customers/[id]/refunds/route'
import { seedIfNeeded, db, createCreditMemo, closePeriod } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function get(url: string) { return new Request(url) }
function post(url: string, body: any) { return new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) }

describe('API: /api/customers/[id]/refunds', () => {
  beforeEach(() => {
    // reset seed
    ;(db.accounts || []).length = 0
    db.transactions.length = 0
    db.invoices.length = 0
    db.bills.length = 0
    db.customers.length = 0
    db.vendors.length = 0
    db.items.length = 0
    db.journalEntries = []
    db.auditEvents = []
    db.seeded = false
    db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }
    db.customerPayments = []
    db.deposits = []
    ;(db as any).creditMemos = []
    db.customerRefunds = []
    try { seedIfNeeded() } catch {}
  })
  afterEach(() => setRoleOverride(undefined as any))

  test('GET refunds: allows with invoices:read (viewer) and returns JSON shape', async () => {
    const cust = db.customers[0]
    // viewer has invoices:read and reports:read
    setRoleOverride('viewer' as any)
    const r1: any = await GET_ROUTE(get(`http://local/api/customers/${cust.id}/refunds`), { params: { id: cust.id } } as any)
    expect(r1.status).toBe(200)
    const j = await r1.json()
    expect(Array.isArray(j?.refunds)).toBe(true)
  })

  test('POST refund enforces RBAC and validations; happy path returns refund', async () => {
    const cust = db.customers[0]
    const cm = createCreditMemo({ customerId: cust.id, lines: [{ description: 'Adj', amount: 100 }], date: '2025-01-05' })

    // Missing invoices:write -> 403
    setRoleOverride('viewer' as any)
    const rForbidden: any = await POST_ROUTE(post(`http://local/api/customers/${cust.id}/refunds`, { amount: 10, date: '2025-01-06', creditMemoId: cm.id }), { params: { id: cust.id } } as any)
    expect(rForbidden.status).toBe(403)

    // Amount must be > 0 -> 400
    setRoleOverride('manager' as any)
    const rBadAmt: any = await POST_ROUTE(post(`http://local/api/customers/${cust.id}/refunds`, { amount: 0, date: '2025-01-06', creditMemoId: cm.id }), { params: { id: cust.id } } as any)
    expect(rBadAmt.status).toBe(400)

    // Happy path
    const rOk: any = await POST_ROUTE(post(`http://local/api/customers/${cust.id}/refunds`, { amount: 25, date: '2025-01-06', creditMemoId: cm.id, method: 'ACH', reference: 'R-123' }), { params: { id: cust.id } } as any)
    expect(rOk.status).toBe(200)
    const jOk = await rOk.json()
    expect(jOk.refund?.amount).toBe(25)
    expect(jOk.refund?.customerId).toBe(cust.id)
  })

  test('POST refund blocked in closed period (<= closeDate)', async () => {
    const cust = db.customers[0]
    const cm = createCreditMemo({ customerId: cust.id, lines: [{ description: 'Adj', amount: 30 }], date: '2025-01-10' })
    closePeriod('2025-01-15')
    setRoleOverride('manager' as any)
    const rClosed: any = await POST_ROUTE(post(`http://local/api/customers/${cust.id}/refunds`, { amount: 10, date: '2025-01-12', creditMemoId: cm.id }), { params: { id: cust.id } } as any)
    expect(rClosed.status).toBe(400)
    const j = await rClosed.json()
    expect(String(j.error || '')).toMatch(/closed period/i)
  })
})
