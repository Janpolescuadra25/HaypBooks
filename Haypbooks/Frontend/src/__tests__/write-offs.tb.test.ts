import { db, createInvoice, updateInvoice, writeOffInvoice } from '@/mock/db'

const req = (u: string) => new Request(u)

async function tb(url: string) {
  db.seeded = true
  const mod = await import('@/app/api/reports/trial-balance/route')
  const TB_GET = (mod as any).GET as (r: Request) => Promise<Response>
  return TB_GET(req(url))
}

function reset() {
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
  db.settings = { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true }
  db.accounts.push(
    { id: 'acc_1000', number: '1000', name: 'Cash', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_1010', number: '1010', name: 'Undeposited Funds', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_1100', number: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_2000', number: '2000', name: 'Accounts Payable', type: 'Liability', balance: 0, active: true } as any,
    { id: 'acc_4000', number: '4000', name: 'Sales Revenue', type: 'Income', balance: 0, active: true } as any,
    { id: 'acc_6000', number: '6000', name: 'Operating Expenses', type: 'Expense', balance: 0, active: true } as any,
  )
  db.customers.push({ id: 'cust_A', name: 'Customer A' } as any)
}

describe('Invoice write-off postings', () => {
  beforeEach(() => reset())

  test('Write-off posts DR expense / CR AR and reduces invoice balance', async () => {
    db.settings!.accountingMethod = 'accrual'
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-WO-1', customerId: cust.id, date: '2025-04-10', lines: [{ description: 'S', amount: 100 }] })
    updateInvoice(inv.id, { status: 'sent' })
    // Write off 40 on 2025-04-12
    writeOffInvoice({ invoiceId: inv.id, amount: 40, date: '2025-04-12' })
    const res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-04-12')
    const data = await res.json()
    const ar = data.rows.find((r: any) => r.number === '1100')
    const rev = data.rows.find((r: any) => r.number === '4000')
    const exp = data.rows.find((r: any) => r.number === '6000')
    // Accrual invoice: AR +100, Revenue -100
    expect(rev?.balance || 0).toBeLessThanOrEqual(-100)
    // Write-off: Expense +40 (debit), AR -40 (credit). Net AR 60
    expect(exp?.balance || 0).toBeGreaterThanOrEqual(40)
    expect(ar?.balance || 0).toBeGreaterThanOrEqual(60)
  })
})
