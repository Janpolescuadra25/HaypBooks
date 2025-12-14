import { GET as GET_PREVIEW } from '@/app/api/accountant/write-offs/preview/route'
import { POST as POST_APPLY } from '@/app/api/accountant/write-offs/apply/route'
import { GET as GET_EXPORT } from '@/app/api/accountant/write-offs/export/route'
import { POST as POST_INVOICE } from '@/app/api/invoices/route'
import { POST as POST_PERIODS } from '@/app/api/periods/route'
import { seedIfNeeded, reopenPeriodWithAudit } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string, method: string = 'GET', body?: any) {
  return new Request(url, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
}

describe('Accountant write-offs: preview/apply/export', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('preview filters by asOf/maxAmount/minDays and returns suggested amounts', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    try { reopenPeriodWithAudit() } catch {}
    // Create a tiny overdue invoice for a specific customer
    const invoiceDate = '2025-07-01T00:00:00.000Z'
    const dueDate = '2025-07-15'
    const invRes: any = await POST_INVOICE(makeReq('http://local/api/invoices', 'POST', { number: 'INV-WO-1', customerId: 'cust_wo', date: invoiceDate, dueDate, lines: [{ description: 'x', amount: 25 }] }))
    const invJson = await invRes.json(); const invId = invJson?.invoice?.id || invJson?.id
    expect(invId).toBeTruthy()

    const asOf = '2025-09-30' // 77 days after due date
    const url = `http://local/api/accountant/write-offs/preview?asOf=${asOf}&maxAmount=30&minDaysPastDue=60&customerId=cust_wo`
    const res: any = await GET_PREVIEW(makeReq(url))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.asOf).toBe(asOf)
    expect(Array.isArray(data.rows)).toBe(true)
    const row = data.rows.find((r: any) => r.customerId === 'cust_wo')
    expect(row).toBeTruthy()
    expect(row.balance).toBeGreaterThan(0)
    expect(row.daysPastDue).toBeGreaterThanOrEqual(60)
    expect(row.suggestedAmount).toBeLessThanOrEqual(30)
  })

  test('apply posts write-offs for provided items and returns results', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    try { reopenPeriodWithAudit() } catch {}
    const invRes: any = await POST_INVOICE(makeReq('http://local/api/invoices', 'POST', { number: 'INV-WO-2', customerId: 'cust_wo2', date: new Date().toISOString(), lines: [{ description: 'y', amount: 12 }] }))
    const invJson = await invRes.json(); const invId = invJson?.invoice?.id || invJson?.id
    const res: any = await POST_APPLY(makeReq('http://local/api/accountant/write-offs/apply', 'POST', { items: [{ id: invId, amount: 5 }] }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(1)
    expect(body.failed).toBe(0)
    expect(Array.isArray(body.results)).toBe(true)
    expect(body.results[0].ok).toBe(true)
    expect(body.results[0].journalEntryId).toBeTruthy()
    expect(body.results[0].newBalance).toBeGreaterThanOrEqual(0)
  })

  test('export delegates to preview, includes caption and currency formatting, gated by permissions', async () => {
    // Without write permission (viewer), expect 403
    setRoleOverride('viewer')
    const resNo: any = await GET_EXPORT(makeReq('http://local/api/accountant/write-offs/export?asOf=2025-10-01'))
    expect(resNo.status).toBe(403)

    // With admin, expect CSV with caption line and header
    setRoleOverride('admin' as any)
    const res: any = await GET_EXPORT(makeReq('http://local/api/accountant/write-offs/export?asOf=2025-10-01'))
    expect(res.status).toBe(200)
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    // Caption line (ISO no-comma As-of)
    expect(lines[0]).toMatch(/^2025-10-01$/)
    // Spacer then header
    expect(lines[2]).toBe('Customer,Invoice,Due Date,Days Past Due,Balance,Suggested Write-off')
    // Filename
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('write-offs-preview-asof-2025-10-01')
  })

  test('apply rejects provided date in closed period', async () => {
    setRoleOverride('admin' as any)
    const today = new Date().toISOString().slice(0,10)
    try { const r: any = await POST_PERIODS(makeReq('http://local/api/periods', 'POST', { closeThrough: today })); await r.json() } catch {}
    const res: any = await POST_APPLY(makeReq('http://local/api/accountant/write-offs/apply', 'POST', { items: [{ id: 'missing', amount: 1 }], date: today }))
    expect([400, 403]).toContain(res.status)
  })
})
