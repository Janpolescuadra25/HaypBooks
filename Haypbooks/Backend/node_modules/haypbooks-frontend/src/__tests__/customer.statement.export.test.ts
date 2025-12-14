import { GET as STMT_JSON } from '@/app/api/customers/[id]/statement/route'
import { GET as STMT_CSV } from '@/app/api/customers/[id]/statement/export/route'
import { seedIfNeeded, db } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function get(url: string) { return new Request(url) }

describe('Customer Statement CSV Export', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })
  afterEach(() => setRoleOverride(undefined as any))

  function anyCustomerId() {
    return (db.customers && db.customers[0]?.id) || 'cust_1'
  }

  test('RBAC 403 without reports:read', async () => {
    setRoleOverride('viewer' as any) // viewer likely has reports:read? if so use no-reports role
    setRoleOverride('no-reports' as any)
    const id = anyCustomerId()
    const res: any = await STMT_CSV(get(`http://local/api/customers/${id}/statement/export?asOf=2025-10-15`), { params: { id } } as any)
    expect(res.status).toBe(403)
  })

  test('CSV export basic shape and filename tokens', async () => {
    setRoleOverride('admin' as any)
    const id = anyCustomerId()
    // Ensure JSON route works
    const jsonRes: any = await STMT_JSON(get(`http://local/api/customers/${id}/statement?asOf=2025-10-15`), { params: { id } } as any)
    expect(jsonRes.status).toBe(200)
    const csvRes: any = await STMT_CSV(get(`http://local/api/customers/${id}/statement/export?asOf=2025-10-15`), { params: { id } } as any)
    expect(csvRes.status).toBe(200)
    const disposition = csvRes.headers.get('Content-Disposition') || ''
    expect(disposition).toMatch(/customer-statement.*cust-/)
    const text = await csvRes.text()
    const lines = text.trim().split(/\n/)
    // Caption, blank spacer, header
  const headerIdx = lines.findIndex((l: string) => l.startsWith('Date,Type,Description,Amount,Running Balance'))
    expect(headerIdx).toBeGreaterThan(0)
    // Totals row present
  const totalsLine = lines.find((l: string) => l.startsWith('Totals,'))
    expect(totalsLine).toBeTruthy()
  })

  test('CSV-Version row appears when requested', async () => {
    setRoleOverride('admin' as any)
    const id = anyCustomerId()
    const res: any = await STMT_CSV(get(`http://local/api/customers/${id}/statement/export?asOf=2025-10-15&csv=1`), { params: { id } } as any)
    expect(res.status).toBe(200)
    const text = await res.text()
    const firstLine = text.split(/\n/)[0].trim()
    // Because we push version row first
    expect(firstLine).toBe('CSV-Version,1')
  })
})
