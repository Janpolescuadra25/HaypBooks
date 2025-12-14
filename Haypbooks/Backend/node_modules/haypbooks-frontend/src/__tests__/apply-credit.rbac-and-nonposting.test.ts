import { mockApi } from '@/lib/mock-api'
import { db, createInvoice, updateInvoice, createCreditMemo, seedIfNeeded } from '@/mock/db'
import { setRoleOverride } from '@/lib/rbac'

function mkReqInit(body: any, role: 'viewer'|'admin'|'manager') {
  setRoleOverride(role as any)
  return { method: 'POST', body: JSON.stringify(body) }
}

describe('Apply Credit Memo → RBAC and non-posting behavior', () => {
  beforeEach(() => {
    // Reset minimal DB state
    db.accounts = [] as any
    db.transactions = [] as any
    db.invoices = [] as any
    db.bills = [] as any
    db.journalEntries = [] as any
    db.auditEvents = [] as any
    db.customers = [] as any
    db.vendors = [] as any
    db.tags = [] as any
    db.seeded = false
    db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true } as any
    seedIfNeeded()
  })

  test('403 when missing invoices:write', async () => {
    // Ensure a customer, invoice, and credit exist
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-AC-1', customerId: cust.id, date: '2025-02-01', lines: [{ description: 'S', amount: 100 }] })
    updateInvoice(inv.id, { status: 'sent' })
    const cm = createCreditMemo({ customerId: cust.id, date: '2025-02-02', lines: [{ description: 'Adj', amount: 50 }] })

    let err: any
    try {
      await mockApi(`/api/invoices/${inv.id}/apply-credit`, mkReqInit({ creditMemoId: cm.id, amount: 25 }, 'viewer'))
    } catch (e: any) {
      err = e
    }
    expect(String(err?.message || '')).toMatch(/403 Forbidden/i)
  })

  test('non-posting application reduces invoice balance without creating a new JE', async () => {
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-AC-2', customerId: cust.id, date: '2025-03-01', lines: [{ description: 'S', amount: 200 }] })
    updateInvoice(inv.id, { status: 'sent' })
    const cm = createCreditMemo({ customerId: cust.id, date: '2025-03-05', lines: [{ description: 'Adj', amount: 60 }] })

    // Pre condition: some JEs exist for invoice and credit creation
    const jeCountBefore = (db.journalEntries || []).length

    // Apply 40 using admin role
    const res: any = await mockApi(`/api/invoices/${inv.id}/apply-credit`, mkReqInit({ creditMemoId: cm.id, amount: 40 }, 'admin'))
    expect(res?.invoice?.balance).toBeCloseTo(160, 2)

    const jeCountAfter = (db.journalEntries || []).length
    expect(jeCountAfter).toBe(jeCountBefore) // applying credit should not add a new JE
  })
})
