import { GET as HIST_JSON } from '@/app/api/receivables/payments/applications/history/route'
import { GET as HIST_CSV } from '@/app/api/receivables/payments/applications/history/export/route'
import { POST as APPLY_PAY } from '@/app/api/invoices/[id]/payments/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function get(url: string) { return new Request(url) }
function post(url: string, body: any) { return new Request(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) }

describe('Payment Application History', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  test('RBAC 403 when missing permissions', async () => {
    setRoleOverride('viewer' as any)
    const r1: any = await HIST_JSON(get('http://local/api/receivables/payments/applications/history'))
    expect(r1.status).toBe(403)
  })

  test('History includes applied payments and filters by date range', async () => {
    setRoleOverride('manager' as any)
    // apply a tiny payment to an open invoice to ensure an event exists
    const inv = (db.invoices || []).find((x: any) => (x.status !== 'void') && ((x.balance ?? (x.total - (x.payments||[]).reduce((s:number,p:any)=> s + Number(p.amount||0),0))) > 0))
    expect(inv).toBeTruthy()
    const applyDate = '2025-10-10'
    const res: any = await APPLY_PAY(post(`http://local/api/invoices/${inv!.id}/payments`, { amount: 1, date: applyDate }), { params: { id: inv!.id } } as any)
    expect(res.status).toBe(200)

    setRoleOverride('admin' as any)
    const r: any = await HIST_JSON(get('http://local/api/receivables/payments/applications/history?start=2025-10-01&end=2025-10-31'))
    expect(r.status).toBe(200)
    const j = await r.json()
    expect(j.history.count).toBeGreaterThan(0)
    // Filter by customerId
    const first = j.history.rows[0]
    const r2: any = await HIST_JSON(get(`http://local/api/receivables/payments/applications/history?customerId=${first.customerId}`))
    const j2 = await r2.json()
    expect(j2.history.rows.every((row: any) => row.customerId === first.customerId)).toBe(true)
  })

  test('CSV export emits version row when requested', async () => {
    setRoleOverride('admin' as any)
    const r: any = await HIST_CSV(get('http://local/api/receivables/payments/applications/history/export?csv=1&start=2025-10-01&end=2025-10-31'))
    expect(r.status).toBe(200)
    const text = await r.text()
  expect(text.split(/\n/)[0].trim()).toBe('CSV-Version,1')
    // Header present
    expect(text.includes('Date,Customer,Invoice,Payment Id,Applied Amount,Remaining Balance,Method,Batch Id')).toBe(true)
  })

  test('CSV export RBAC: requires both audit:read and reports:read', async () => {
    setRoleOverride('viewer' as any)
    const r1: any = await HIST_CSV(get('http://local/api/receivables/payments/applications/history/export'))
    expect(r1.status).toBe(403)
    setRoleOverride('admin' as any)
    const r2: any = await HIST_CSV(get('http://local/api/receivables/payments/applications/history/export'))
    expect(r2.status).toBe(200)
  })
})
