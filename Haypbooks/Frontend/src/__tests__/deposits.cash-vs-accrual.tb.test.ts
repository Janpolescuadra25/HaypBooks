import { db, createInvoice, updateInvoice, createCustomerPayment, createDeposit } from '@/mock/db'

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

describe('Deposits lifecycle in TB (cash vs accrual)', () => {
  beforeEach(() => reset())

  test('Cash: payment to Undeposited (DR 1010 CR revenue), then deposit (DR 1000 CR 1010)', async () => {
    db.settings!.accountingMethod = 'cash'
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-CASH-DEP', customerId: cust.id, date: '2025-02-05', lines: [{ description: 'S', amount: 200 }] })
    updateInvoice(inv.id, { status: 'sent' })
    const cp = createCustomerPayment({ customerId: cust.id, amountReceived: 200, date: '2025-02-10', allocations: [{ invoiceId: inv.id, amount: 200 }] })
    let res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-02-10')
    let data = await res.json()
    const rev1 = data.rows.find((r: any) => r.number === '4000')
    const uf1 = data.rows.find((r: any) => r.number === '1010')
    const cash1 = data.rows.find((r: any) => r.number === '1000')
    expect(rev1?.balance || 0).toBeLessThanOrEqual(-200)
    expect(uf1?.balance || 0).toBeGreaterThanOrEqual(200)
    expect((cash1?.balance || 0)).toBe(0)
    // Deposit the payment into Cash
    createDeposit({ date: '2025-02-12', paymentIds: cp.paymentIds, accountNumber: '1000' })
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-02-12')
    data = await res.json()
    const rev2 = data.rows.find((r: any) => r.number === '4000')
    const uf2 = data.rows.find((r: any) => r.number === '1010')
    const cash2 = data.rows.find((r: any) => r.number === '1000')
    expect(rev2?.balance || 0).toBeLessThanOrEqual(-200)
    expect((uf2?.balance || 0)).toBe(0)
    expect(cash2?.balance || 0).toBeGreaterThanOrEqual(200)
  })

  test('Accrual: sent invoice posts AR/Revenue; payment to Undeposited reduces AR; deposit moves to Cash', async () => {
    db.settings!.accountingMethod = 'accrual'
    const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-ACC-DEP', customerId: cust.id, date: '2025-03-05', lines: [{ description: 'S', amount: 300 }] })
    updateInvoice(inv.id, { status: 'sent' })
    let res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-03-05')
    let data = await res.json()
    const ar0 = data.rows.find((r: any) => r.number === '1100')
    const rev0 = data.rows.find((r: any) => r.number === '4000')
    expect(ar0?.balance || 0).toBeGreaterThanOrEqual(300)
    expect(rev0?.balance || 0).toBeLessThanOrEqual(-300)
    // Receive payment to Undeposited
    const cp = createCustomerPayment({ customerId: cust.id, amountReceived: 300, date: '2025-03-06', allocations: [{ invoiceId: inv.id, amount: 300 }] })
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-03-06')
    data = await res.json()
    const ar1 = data.rows.find((r: any) => r.number === '1100')
    const uf1 = data.rows.find((r: any) => r.number === '1010')
    expect((ar1?.balance || 0)).toBe(0)
    expect(uf1?.balance || 0).toBeGreaterThanOrEqual(300)
    // Deposit into Cash
    createDeposit({ date: '2025-03-07', paymentIds: cp.paymentIds, accountNumber: '1000' })
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-03-07')
    data = await res.json()
    const uf2 = data.rows.find((r: any) => r.number === '1010')
    const cash2 = data.rows.find((r: any) => r.number === '1000')
    const rev2 = data.rows.find((r: any) => r.number === '4000')
    expect((uf2?.balance || 0)).toBe(0)
    expect(cash2?.balance || 0).toBeGreaterThanOrEqual(300)
    expect(rev2?.balance || 0).toBeLessThanOrEqual(-300)
  })
})
