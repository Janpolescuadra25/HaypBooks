import { seedIfNeeded, db, createInvoice, updateInvoice, applyPaymentToInvoice } from '@/mock/db'
import { GET as COLLECTIONS_GET } from '@/app/api/collections/overview/route'

describe('Collections Overview API — customerId filter', () => {
  beforeAll(() => { seedIfNeeded() })

  test('filters rows to the specified customer and recomputes totals', async () => {
    const baseTs = Date.now()
    const makeCust = (suffix: string, creditLimit?: number) => {
      const c = { id: `coll_filter_${suffix}_${baseTs}`, name: `CollFilter ${suffix}`, creditLimit }
      db.customers.push(c as any)
      return c
    }
    const target = makeCust('target', 2500)
    const distractor = makeCust('other', 5000)

    // Seed invoices so the target appears with non-zero balances
    const today = new Date().toISOString().slice(0,10)
    const inv1 = createInvoice({ number: `F1_${baseTs}`, customerId: target.id, date: today, lines: [{ description: 'S', amount: 600 }] })
    updateInvoice(inv1.id, { status: 'sent' })
    applyPaymentToInvoice(inv1.id, 100) // partial to ensure net receivable > 0

    // Add another customer invoice to ensure filtering removes it
    const inv2 = createInvoice({ number: `X1_${baseTs}`, customerId: distractor.id, date: today, lines: [{ description: 'X', amount: 300 }] })
    updateInvoice(inv2.id, { status: 'sent' })

    const req = new Request(`http://localhost/api/collections/overview?asOf=${today}&customerId=${target.id}`)
    const res: any = await COLLECTIONS_GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    const { overview } = json

    // All rows must belong to the target customer
    expect(overview.rows.length).toBeGreaterThan(0)
    for (const r of overview.rows) {
      expect(r.customerId).toBe(target.id)
    }

    // Totals should equal the sum of filtered rows
    const sum = overview.rows.reduce((acc: any, r: any) => {
      acc.open += r.openBalance
      acc.overdue += r.overdueBalance
      acc.net += r.netReceivable
      return acc
    }, { open: 0, overdue: 0, net: 0 })
    const tol = 0.01
    expect(Math.abs(overview.totals.openBalance - sum.open)).toBeLessThanOrEqual(tol)
    expect(Math.abs(overview.totals.overdueBalance - sum.overdue)).toBeLessThanOrEqual(tol)
    expect(Math.abs(overview.totals.netReceivable - sum.net)).toBeLessThanOrEqual(tol)
    // customers count should match number of rows
    expect(overview.totals.customers).toBe(overview.rows.length)
  })
})
