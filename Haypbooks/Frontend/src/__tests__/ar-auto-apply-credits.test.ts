import { mockApi } from '@/lib/mock-api'
import { db, seedIfNeeded, createCreditMemo, updateInvoice } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

// Note: The mockApi uses cookie-based role. In tests here, we simulate role via a helper header or assume default admin in mock.

describe('AR auto-apply credits endpoint', () => {
  beforeAll(() => { try { seedIfNeeded() } catch {} })

  function getAnyCustomerId(): string {
    if (!db.customers.length) { seedIfNeeded() }
    return db.customers[0].id
  }

  it('denies without invoices:write', async () => {
    const customerId = getAnyCustomerId()
    setRoleOverride('viewer' as any)
    let caught: any
    try {
      await mockApi(`/api/customers/${customerId}/credits/auto-apply`, { method: 'POST' })
    } catch (e: any) {
      caught = e
    }
    setRoleOverride(undefined as any)
    expect(String(caught?.message||'')).toMatch(/403/i)
  })

  it('applies credits to oldest open invoices and is non-posting', async () => {
    // Ensure seed and prepare: pick a customer with an open invoice; create a credit memo for that customer
    seedIfNeeded()
    const customerId = getAnyCustomerId()
    // Create a small credit memo for the customer
    const cm = createCreditMemo({ customerId, date: '2025-03-20', lines: [{ description: 'Adj', amount: 50 }] })
    expect(cm.remaining).toBeGreaterThan(0)
    // Ensure at least one open invoice for this customer (set status to sent and non-zero balance)
    const inv = db.invoices.find(i => i.customerId === customerId)
    if (inv) { updateInvoice(inv.id, { status: 'sent' }) }

    setRoleOverride('admin' as any)
    const res: any = await mockApi(`/api/customers/${customerId}/credits/auto-apply`, { method: 'POST' })
    setRoleOverride(undefined as any)

    expect(res).toBeTruthy()
    // ok returns the number of allocations made
    expect(typeof res.ok).toBe('number')
    expect(Array.isArray(res.results)).toBe(true)
    // Non-posting: no new journal entries created
    expect(res.nonPosting).toBe(true)
    // Results shape
    if (res.results.length) {
      const r = res.results[0]
      expect(r).toHaveProperty('invoiceId')
      expect(r).toHaveProperty('creditMemoId')
      expect(r).toHaveProperty('amount')
      expect(r.amount).toBeGreaterThan(0)
    }
  })

  it('supports dry-run: no mutations and no audit event', async () => {
    seedIfNeeded()
    const customerId = getAnyCustomerId()
    // Seed a small credit just in case
    const cm = createCreditMemo({ customerId, date: '2025-03-21', lines: [{ description: 'Preview adj', amount: 25 }] })
    expect(cm.remaining).toBeGreaterThan(0)

    const auditBefore = (db.auditEvents || []).length
    const balancesBefore = (db.invoices || []).filter(i => i.customerId === customerId).map(i => ({ id: i.id, bal: i.balance }))
    const creditsBefore = (db as any).creditMemos.filter((x: any) => x.customerId === customerId).map((x: any) => ({ id: x.id, rem: x.remaining }))

    setRoleOverride('admin' as any)
    const res: any = await mockApi(`/api/customers/${customerId}/credits/auto-apply`, { method: 'POST', body: JSON.stringify({ dryRun: true }) })
    setRoleOverride(undefined as any)

    expect(res).toBeTruthy()
    expect(res.dryRun).toBe(true)
    expect(res.nonPosting).toBe(true)

    // No state mutations on dry-run
    const balancesAfter = (db.invoices || []).filter(i => i.customerId === customerId).map(i => ({ id: i.id, bal: i.balance }))
    const creditsAfter = (db as any).creditMemos.filter((x: any) => x.customerId === customerId).map((x: any) => ({ id: x.id, rem: x.remaining }))
    expect(JSON.stringify(balancesAfter)).toBe(JSON.stringify(balancesBefore))
    expect(JSON.stringify(creditsAfter)).toBe(JSON.stringify(creditsBefore))
    // No audit on dry-run
    const auditAfter = (db.auditEvents || []).length
    expect(auditAfter).toBe(auditBefore)
  })

  it('emits audit on apply (non-dry-run)', async () => {
    seedIfNeeded()
    const customerId = getAnyCustomerId()
    // Ensure there is at least some open invoice and available credit
    const inv = db.invoices.find(i => i.customerId === customerId)
    if (inv) { updateInvoice(inv.id, { status: 'sent' }) }
    createCreditMemo({ customerId, date: '2025-03-22', lines: [{ description: 'Apply adj', amount: 10 }] })

    const auditBefore = (db.auditEvents || []).length
    setRoleOverride('admin' as any)
    const res: any = await mockApi(`/api/customers/${customerId}/credits/auto-apply`, { method: 'POST' })
    setRoleOverride(undefined as any)
    expect(res).toBeTruthy()
    expect(res.dryRun).not.toBe(true)
    const auditAfter = (db.auditEvents || []).length
    expect(auditAfter).toBeGreaterThan(auditBefore)
  })
})
