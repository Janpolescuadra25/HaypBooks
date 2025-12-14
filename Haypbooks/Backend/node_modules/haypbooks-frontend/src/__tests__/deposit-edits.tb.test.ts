import { db, createInvoice, updateInvoice, createCustomerPayment, createDeposit, removePaymentsFromDeposit, addPaymentsToDeposit } from '@/mock/db'

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

describe('Deposit edits adjust JE and payment flags', () => {
  beforeEach(() => reset())

  test('Remove and add payments adjusts 1010 and bank appropriately', async () => {
    db.settings!.accountingMethod = 'accrual'
    const cust = db.customers[0]
    const inv1 = createInvoice({ number: 'INV-DE-1', customerId: cust.id, date: '2025-04-05', lines: [{ description: 'S', amount: 100 }] })
    const inv2 = createInvoice({ number: 'INV-DE-2', customerId: cust.id, date: '2025-04-05', lines: [{ description: 'S', amount: 80 }] })
    updateInvoice(inv1.id, { status: 'sent' })
    updateInvoice(inv2.id, { status: 'sent' })
    const cp1 = createCustomerPayment({ customerId: cust.id, amountReceived: 100, date: '2025-04-06', allocations: [{ invoiceId: inv1.id, amount: 100 }] })
    const cp2 = createCustomerPayment({ customerId: cust.id, amountReceived: 80, date: '2025-04-06', allocations: [{ invoiceId: inv2.id, amount: 80 }] })
    const dep = createDeposit({ date: '2025-04-07', paymentIds: [...cp1.paymentIds, ...cp2.paymentIds], accountNumber: '1000' })
    let res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-04-07')
    let data = await res.json()
    let cash = data.rows.find((r: any) => r.number === '1000')
    let uf = data.rows.find((r: any) => r.number === '1010')
    expect(cash?.balance || 0).toBeGreaterThanOrEqual(180)
    expect((uf?.balance || 0)).toBe(0)

    // Remove cp2 from deposit on 2025-04-08 => DR 1010 / CR 1000 by 80
    removePaymentsFromDeposit(dep.id, cp2.paymentIds, { date: '2025-04-08' })
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-04-08')
    data = await res.json()
    cash = data.rows.find((r: any) => r.number === '1000')
    uf = data.rows.find((r: any) => r.number === '1010')
    expect(cash?.balance || 0).toBeGreaterThanOrEqual(100)
    expect(uf?.balance || 0).toBeGreaterThanOrEqual(80)

    // Add cp2 back on 2025-04-09 => DR 1000 / CR 1010 by 80
    addPaymentsToDeposit(dep.id, cp2.paymentIds, { date: '2025-04-09' })
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-04-09')
    data = await res.json()
    cash = data.rows.find((r: any) => r.number === '1000')
    uf = data.rows.find((r: any) => r.number === '1010')
    expect(cash?.balance || 0).toBeGreaterThanOrEqual(180)
    expect((uf?.balance || 0)).toBe(0)
  })
})
