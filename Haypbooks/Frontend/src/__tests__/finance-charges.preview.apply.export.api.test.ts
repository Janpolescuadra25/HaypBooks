import { GET as GET_PREVIEW } from '@/app/api/accountant/finance-charges/preview/route'
import { POST as POST_APPLY } from '@/app/api/accountant/finance-charges/apply/route'
import { GET as GET_EXPORT } from '@/app/api/accountant/finance-charges/export/route'
import { POST as POST_INVOICE } from '@/app/api/invoices/route'
import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { seedIfNeeded, reopenPeriodWithAudit } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string, method: string = 'GET', body?: any) {
  return new Request(url, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
}

describe('Accountant finance charges: preview/apply/export', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('preview computes suggested charges using rate/min/grace and filters by customerId', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    try { reopenPeriodWithAudit() } catch {}
    // Create an overdue invoice for a dedicated customer
    const invoiceDate = '2025-07-01T00:00:00.000Z'
    const dueDate = '2025-07-15'
    const invRes: any = await POST_INVOICE(makeReq('http://local/api/invoices', 'POST', { number: 'INV-FC-1', customerId: 'cust_fc', date: invoiceDate, dueDate, lines: [{ description: 'x', amount: 100 }] }))
    const invJson = await invRes.json(); const invId = invJson?.invoice?.id || invJson?.id
    expect(invId).toBeTruthy()

    const asOf = '2025-09-30' // 77 days after due date
    const url = `http://local/api/accountant/finance-charges/preview?asOf=${asOf}&annualRatePct=18&minCharge=2&graceDays=0&customerId=cust_fc`
    const res: any = await GET_PREVIEW(makeReq(url))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.asOf).toBe(asOf)
    expect(Array.isArray(data.rows)).toBe(true)
    const row = data.rows.find((r: any) => r.customerId === 'cust_fc')
    expect(row).toBeTruthy()
    expect(row.balance).toBeGreaterThan(0)
    expect(row.daysPastDue).toBeGreaterThanOrEqual(60)
    expect(row.assessDays).toBeGreaterThan(0)
    expect(row.suggestedCharge).toBeGreaterThanOrEqual(2) // minCharge floor
  })

  test('apply posts finance charges and returns results with newBalance', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    try { reopenPeriodWithAudit() } catch {}
    const invRes: any = await POST_INVOICE(makeReq('http://local/api/invoices', 'POST', { number: 'INV-FC-2', customerId: 'cust_fc2', date: new Date().toISOString(), lines: [{ description: 'y', amount: 50 }] }))
    const invJson = await invRes.json(); const invId = invJson?.invoice?.id || invJson?.id
    const res: any = await POST_APPLY(makeReq('http://local/api/accountant/finance-charges/apply', 'POST', { items: [{ invoiceId: invId, amount: 5 }], date: new Date().toISOString().slice(0,10) }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(1)
    expect(body.failed).toBe(0)
    expect(Array.isArray(body.results)).toBe(true)
    expect(body.results[0].ok).toBe(true)
    expect(body.results[0].journalEntryId).toBeTruthy()
    expect(body.results[0].newBalance).toBeGreaterThanOrEqual(0)
  })

  test('export delegates to preview, includes caption and header, and enforces RBAC parity', async () => {
    // Without write permission (viewer), expect 403
    setRoleOverride('viewer')
    const resNo: any = await GET_EXPORT(makeReq('http://local/api/accountant/finance-charges/export?asOf=2025-10-01'))
    expect(resNo.status).toBe(403)

    // With admin, expect CSV with caption line and header
    setRoleOverride('admin' as any)
    const res: any = await GET_EXPORT(makeReq('http://local/api/accountant/finance-charges/export?asOf=2025-10-01'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    // Caption line (ISO no-comma As-of)
    expect(lines[0]).toMatch(/^2025-10-01$/)
    // Spacer then header
    expect(lines[2]).toBe('Customer,Invoice,Due Date,Days Past Due,Assess Days,Balance,Suggested Finance Charge')
    // Filename
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('finance-charges-preview-asof-2025-10-01')
  })

  test('apply rejects provided date in closed period', async () => {
    setRoleOverride('admin' as any)
    const today = new Date().toISOString().slice(0,10)
    try { const r: any = await POST_PERIODS(makeReq('http://local/api/periods', 'POST', { closeThrough: today })); await r.json() } catch {}
    const res: any = await POST_APPLY(makeReq('http://local/api/accountant/finance-charges/apply', 'POST', { items: [{ invoiceId: 'missing', amount: 1 }], date: today }))
    expect([400, 403]).toContain(res.status)
  })
})
