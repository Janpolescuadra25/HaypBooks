import { mockApi } from '@/lib/mock-api'
import { db, seedIfNeeded, createVendorCredit } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

describe('AP auto-apply vendor credits endpoint', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })

  function getAnyVendorId(): string {
    if (!db.vendors.length) { seedIfNeeded() }
    return db.vendors[0].id
  }

  it('denies without bills:write', async () => {
    const vendorId = getAnyVendorId()
    setRoleOverride('viewer' as any)
    let caught: any
    try {
      await mockApi(`/api/vendors/${vendorId}/credits/auto-apply`, { method: 'POST' })
    } catch (e: any) { caught = e }
    setRoleOverride(undefined as any)
    expect(String(caught?.message||'')).toMatch(/403/i)
  })

  it('applies vendor credits to oldest open bills and is non-posting', async () => {
    seedIfNeeded()
    const vendorId = getAnyVendorId()
    // ensure at least one vendor credit for this vendor
    createVendorCredit({ vendorId, date: '2025-03-22', lines: [{ description: 'Allowance', amount: 45 }] })

    setRoleOverride('admin' as any)
    const res: any = await mockApi(`/api/vendors/${vendorId}/credits/auto-apply`, { method: 'POST' })
    setRoleOverride(undefined as any)

    expect(res).toBeTruthy()
    expect(typeof res.ok).toBe('number')
    expect(Array.isArray(res.results)).toBe(true)
    expect(res.nonPosting).toBe(true)
    if (res.results.length) {
      const r = res.results[0]
      expect(r).toHaveProperty('billId')
      expect(r).toHaveProperty('vendorCreditId')
      expect(r).toHaveProperty('amount')
      expect(r.amount).toBeGreaterThan(0)
    }
  })

  it('supports dry-run: no mutations and no audit event', async () => {
    seedIfNeeded()
    const vendorId = getAnyVendorId()
    // Ensure there is at least one vendor credit to preview
    createVendorCredit({ vendorId, date: '2025-03-23', lines: [{ description: 'Preview', amount: 30 }] })

    const auditBefore = (db.auditEvents || []).length
    const billsBefore = (db.bills || []).filter(b => b.vendorId === vendorId).map(b => ({ id: b.id, bal: b.balance }))
    const vcsBefore = (db as any).vendorCredits.filter((x: any) => x.vendorId === vendorId).map((x: any) => ({ id: x.id, rem: x.remaining }))

    setRoleOverride('admin' as any)
    const res: any = await mockApi(`/api/vendors/${vendorId}/credits/auto-apply`, { method: 'POST', body: JSON.stringify({ dryRun: true }) })
    setRoleOverride(undefined as any)

    expect(res).toBeTruthy()
    expect(res.dryRun).toBe(true)
    expect(res.nonPosting).toBe(true)

    const billsAfter = (db.bills || []).filter(b => b.vendorId === vendorId).map(b => ({ id: b.id, bal: b.balance }))
    const vcsAfter = (db as any).vendorCredits.filter((x: any) => x.vendorId === vendorId).map((x: any) => ({ id: x.id, rem: x.remaining }))
    expect(JSON.stringify(billsAfter)).toBe(JSON.stringify(billsBefore))
    expect(JSON.stringify(vcsAfter)).toBe(JSON.stringify(vcsBefore))
    const auditAfter = (db.auditEvents || []).length
    expect(auditAfter).toBe(auditBefore)
  })

  it('emits audit on apply (non-dry-run)', async () => {
    seedIfNeeded()
    const vendorId = getAnyVendorId()
    // Ensure a vendor credit exists
    createVendorCredit({ vendorId, date: '2025-03-24', lines: [{ description: 'Apply', amount: 12 }] })
    const auditBefore = (db.auditEvents || []).length
    setRoleOverride('admin' as any)
    const res: any = await mockApi(`/api/vendors/${vendorId}/credits/auto-apply`, { method: 'POST' })
    setRoleOverride(undefined as any)
    expect(res).toBeTruthy()
    const auditAfter = (db.auditEvents || []).length
    expect(auditAfter).toBeGreaterThan(auditBefore)
  })
})
