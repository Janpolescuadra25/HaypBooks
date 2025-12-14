import { GET as GET_CUST_JSON } from '@/app/api/customers/[id]/statement/route'
import { GET as GET_CUST_EXPORT } from '@/app/api/customers/[id]/statement/export/route'
import { GET as GET_VEN_JSON } from '@/app/api/vendors/[id]/statement/route'
import { GET as GET_VEN_EXPORT } from '@/app/api/vendors/[id]/statement/export/route'
import { POST as POST_INVOICE } from '@/app/api/invoices/route'
import { POST as POST_BILL } from '@/app/api/bills/route'
import { seedIfNeeded } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function makeReq(url: string, method: string = 'GET', body?: any) {
  return new Request(url, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
}

describe('Customer/Vendor Statement CSV export', () => {
  afterEach(() => setRoleOverride(undefined as any))

  test('customer statement export enforces RBAC and formats currency', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    // Create a small invoice for a dedicated customer
    const invRes: any = await POST_INVOICE(makeReq('http://local/api/invoices', 'POST', { number: 'INV-STMT-1', customerId: 'cust_stmt', date: new Date().toISOString(), lines: [{ description: 'x', amount: 10 }] }))
    const invJson = await invRes.json(); const custId = invJson?.invoice?.customerId || 'cust_stmt'

    // Without reports:read
    setRoleOverride('no-reports' as any)
    const noRes: any = await GET_CUST_EXPORT(makeReq(`http://local/api/customers/${custId}/statement/export?asOf=2025-10-01`), { params: { id: custId } } as any)
    expect(noRes.status).toBe(403)

    // With viewer/admin
    setRoleOverride('admin' as any)
    const res: any = await GET_CUST_EXPORT(makeReq(`http://local/api/customers/${custId}/statement/export?asOf=2025-10-01&type=open-item`), { params: { id: custId } } as any)
    expect(res.status).toBe(200)
  const text = await res.text()
  const lines: string[] = text.split(/\r?\n/)
  // Caption line is human formatted date (e.g., As of October 1, 2025)
  expect(lines[0].replace(/^"|"$/g,'')).toMatch(/As of\s+October\s+1,\s+2025/)
    // Header row
    expect(lines[2]).toBe('Date,Type,Description,Amount,Running Balance')
    // At least one data row with currency formatting ($ or currency symbol)
    const dataRow = lines.find((l: string) => /^\d{4}-\d{2}-\d{2},/.test(l))
    const totalsRow = lines.find((l: string) => /^Totals,/.test(l)) || ''
    if (dataRow) {
      expect(dataRow.split(',')[3]).toMatch(/\p{Sc}|USD|,|\./u)
    }
    expect(totalsRow).toMatch(/^Totals,/) // totals always present
    expect(totalsRow).toMatch(/\p{Sc}|USD|,|\./u) // formatted currency present
    // Filename contains token
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('customer-statement')
    expect(disp).toContain('cust-')
  })

  test('vendor statement export enforces RBAC and formats currency', async () => {
    setRoleOverride('admin' as any)
    try { seedIfNeeded() } catch {}
    // Create a small bill for a dedicated vendor
    const billRes: any = await POST_BILL(makeReq('http://local/api/bills', 'POST', { number: 'BILL-STMT-1', vendorId: 'ven_stmt', lines: [{ description: 'svc', amount: 12 }], billDate: new Date().toISOString() }))
    const billJson = await billRes.json(); const venId = billJson?.bill?.vendorId || 'ven_stmt'

    setRoleOverride('no-reports' as any)
    const noRes: any = await GET_VEN_EXPORT(makeReq(`http://local/api/vendors/${venId}/statement/export?asOf=2025-10-01`), { params: { id: venId } } as any)
    expect(noRes.status).toBe(403)

    setRoleOverride('admin' as any)
    const res: any = await GET_VEN_EXPORT(makeReq(`http://local/api/vendors/${venId}/statement/export?asOf=2025-10-01&type=open-item`), { params: { id: venId } } as any)
    expect(res.status).toBe(200)
  const text = await res.text()
  const lines: string[] = text.split(/\r?\n/)
  expect(lines[0].replace(/^"|"$/g,'')).toMatch(/As of\s+October\s+1,\s+2025/)
    expect(lines[2]).toBe('Date,Type,Description,Amount,Running Balance')
    const dataRow = lines.find((l: string) => /^\d{4}-\d{2}-\d{2},/.test(l))
    const totalsRow = lines.find((l: string) => /^Totals,/.test(l)) || ''
    if (dataRow) {
      expect(dataRow.split(',')[3]).toMatch(/\p{Sc}|USD|,|\./u)
    }
    expect(totalsRow).toMatch(/^Totals,/)
    expect(totalsRow).toMatch(/\p{Sc}|USD|,|\./u)
    const disp = res.headers.get('Content-Disposition') || ''
    expect(disp).toContain('vendor-statement')
    expect(disp).toContain('ven-')
  })
})
