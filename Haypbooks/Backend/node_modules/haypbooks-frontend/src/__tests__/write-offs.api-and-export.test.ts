import { GET as PREVIEW_GET } from '@/app/api/accountant/write-offs/preview/route'
import { POST as APPLY_POST } from '@/app/api/accountant/write-offs/apply/route'
import { GET as EXPORT_GET } from '@/app/api/accountant/write-offs/export/route'
import { mockApi } from '@/lib/mock-api'
import { seedIfNeeded, db } from '@/mock/db'

const makeReq = (url: string, method: string = 'GET', body?: any) => new Request(url, {
  method,
  headers: body ? { 'Content-Type': 'application/json' } : undefined,
  body: body ? JSON.stringify(body) : undefined,
})

describe('Write-offs preview/apply/export', () => {
  beforeAll(() => {
    try { seedIfNeeded() } catch {}
  })

  it('finds small, aged invoice in preview and applies write-off, then exports CSV with version flag', async () => {
    // Arrange: create a small invoice that qualifies for small-balance + aged criteria
    const asOf = '2025-03-01'
    const invDate = '2025-01-01'
    // Create customer via mock API (ensures environment stable)
    await mockApi<any>('http://localhost/api/customers', { method: 'GET' })
    const custId = db.customers[0]?.id || 'cust_1'
    const create = await mockApi<any>('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify({ customerId: custId, number: `INV-WO-${Math.floor(Math.random()*10000)}`, date: invDate, lines: [{ description: 'Small Item', amount: 45 }] }) })
    const invoice = create.invoice
    // Mark as sent so it is not draft
    await mockApi<any>(`http://localhost/api/invoices/${invoice.id}`, { method: 'PUT', body: JSON.stringify({ status: 'sent' }) })

    // Preview request: should include this invoice (balance 45 <= maxAmount 50, daysPastDue >= 30)
    const previewUrl = `http://test/api/accountant/write-offs/preview?asOf=${asOf}&maxAmount=50&minDaysPastDue=30`
    const previewRes: any = await PREVIEW_GET(makeReq(previewUrl))
    expect(previewRes.status).toBe(200)
    const preview = await previewRes.json()
    expect(Array.isArray(preview.rows)).toBe(true)
    const found = preview.rows.find((r: any) => r.id === invoice.id)
    expect(found).toBeTruthy()
    expect(found.suggestedAmount).toBeGreaterThan(0)

    // Export CSV BEFORE applying, so the candidate list still includes our invoice
    const exportUrl = `http://test/api/accountant/write-offs/export?asOf=${asOf}&maxAmount=50&minDaysPastDue=30&csvVersion=1`
    const exportRes: any = await EXPORT_GET(makeReq(exportUrl))
    expect(exportRes.status).toBe(200)
    const csv = await exportRes.text()
    const lines = csv.split('\n')
    expect(lines[0]).toBe('CSV-Version,1')
    // Header should be present on line 3 (after caption blank line)
    expect(lines.some((l: string) => l.includes('Customer,Invoice,Due Date,Days Past Due,Balance,Suggested Write-off'))).toBe(true)
  // CSV should include some identifier for our invoice: prefer number, but id is acceptable as a fallback
  expect(csv.includes(invoice.number) || csv.includes(invoice.id)).toBe(true)

    // Apply write-off for the candidate
    const applyPayload = { items: [{ id: invoice.id, amount: found.suggestedAmount }], date: asOf, memoPrefix: 'Small balance' }
    const applyRes: any = await APPLY_POST(makeReq('http://test/api/accountant/write-offs/apply', 'POST', applyPayload))
    expect(applyRes.status).toBe(200)
    const applied = await applyRes.json()
    expect(applied.ok).toBe(1)
    const detail = applied.results.find((r: any) => r.id === invoice.id)
    expect(detail?.ok).toBe(true)
    expect(detail?.newBalance).toBe(0)
  })
})
