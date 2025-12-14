import { db, createInvoice, updateInvoice, applyPaymentToInvoice, createBill, applyPaymentToBill } from '@/mock/db'

const req = (u: string) => new Request(u)

async function tb(url: string) {
  // Ensure no seeding occurs on import
  db.seeded = true
  const mod = await import('@/app/api/reports/trial-balance/route')
  const TB_GET = (mod as any).GET as (r: Request) => Promise<Response>
  return TB_GET(req(url))
}

function reset() {
  // Hard reset to isolated state (no seed)
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
  // Minimal chart of accounts
  db.accounts.push(
    { id: 'acc_1000', number: '1000', name: 'Cash', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_1010', number: '1010', name: 'Undeposited Funds', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_1100', number: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 0, active: true } as any,
    { id: 'acc_2000', number: '2000', name: 'Accounts Payable', type: 'Liability', balance: 0, active: true } as any,
    { id: 'acc_4000', number: '4000', name: 'Sales Revenue', type: 'Income', balance: 0, active: true } as any,
    { id: 'acc_6000', number: '6000', name: 'Operating Expenses', type: 'Expense', balance: 0, active: true } as any,
  )
  // A couple of entities
  db.customers.push({ id: 'cust_A', name: 'Customer A' } as any, { id: 'cust_B', name: 'Customer B' } as any)
  db.vendors.push({ id: 'ven_A', name: 'Vendor A' } as any, { id: 'ven_B', name: 'Vendor B' } as any)
}

describe('Accounting method drives posting behavior', () => {
  beforeEach(() => reset())

  test('Accrual: invoice posts AR/revenue when sent', async () => {
  db.settings!.accountingMethod = 'accrual'
  const cust = db.customers[0]
    const inv = createInvoice({ number: 'INV-T-ACC', customerId: cust.id, date: '2025-02-10', lines: [{ description: 'S', amount: 100 }] })
    updateInvoice(inv.id, { status: 'sent' })
  const res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-02-28')
    const data = await res.json()
  const ar = data.rows.find((r: any) => r.number === '1100')
  const rev = data.rows.find((r: any) => r.number === '4000')
  // Assets (AR) have positive balance for debits; Income (Revenue) will be negative balance for credits
  expect(ar?.balance || 0).toBeGreaterThanOrEqual(100)
  expect(rev?.balance || 0).toBeLessThanOrEqual(-100)
  })

  test('Cash: invoice does not post until payment; payment posts DR cash/undeposited CR revenue', async () => {
  db.settings!.accountingMethod = 'cash'
    const cust = db.customers[1]
    const inv = createInvoice({ number: 'INV-T-CASH', customerId: cust.id, date: '2025-02-11', lines: [{ description: 'S', amount: 150 }] })
    updateInvoice(inv.id, { status: 'sent' })
  let res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-02-12')
    let data = await res.json()
  // No AR/Revenue yet under cash before payment (no JE from invoice)
  const ar0 = data.rows.find((r: any) => r.number === '1100')
  const rev0 = data.rows.find((r: any) => r.number === '4000')
  expect((ar0?.debit||0)+(ar0?.credit||0)).toBe(0)
  expect((rev0?.debit||0)+(rev0?.credit||0)).toBe(0)
    // Apply payment -> AR decreases, cash increases
    applyPaymentToInvoice(inv.id, 150, { date: '2025-02-13', fundSource: 'cash' })
  res = await tb('http://localhost/api/reports/trial-balance?end=2025-02-14')
    data = await res.json()
  const cash = data.rows.find((r: any) => r.number === '1000')
  const rev = data.rows.find((r: any) => r.number === '4000')
  // Cash increases (positive), Revenue recognized (negative balance for credit)
  expect(cash?.balance || 0).toBeGreaterThanOrEqual(150)
  expect(rev?.balance || 0).toBeLessThanOrEqual(-150)
  })

  test('Accrual: bill posts DR expense CR AP on creation', async () => {
  db.settings!.accountingMethod = 'accrual'
  const ven = db.vendors[0]
    createBill({ number: 'B-ACC-1', vendorId: ven.id, billDate: '2025-02-15', terms: 'Net 0', lines: [{ description: 'X', amount: 80 }] })
  const res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-02-28')
    const data = await res.json()
  const exp = data.rows.find((r: any) => r.number === '6000')
  const ap = data.rows.find((r: any) => r.number === '2000')
  // Expense increases (positive), AP increases as credit (negative balance)
  expect(exp?.balance || 0).toBeGreaterThanOrEqual(80)
  expect(ap?.balance || 0).toBeLessThanOrEqual(-80)
  })

  test('Cash: bill does not post until payment; paying posts DR expense CR cash', async () => {
  db.settings!.accountingMethod = 'cash'
    const ven = db.vendors[1]
    const bill = createBill({ number: 'B-CASH-1', vendorId: ven.id, billDate: '2025-02-16', terms: 'Net 0', lines: [{ description: 'X', amount: 60 }] })
  let res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-02-16')
    let data = await res.json()
    // No posting yet
    const exp0 = data.rows.find((r: any) => r.number === '6000')
    const ap0 = data.rows.find((r: any) => r.number === '2000')
    expect((exp0?.debit||0)+(exp0?.credit||0)).toBe(0)
    expect((ap0?.debit||0)+(ap0?.credit||0)).toBe(0)
    // Payment posts
    applyPaymentToBill(bill.id, 60, { date: '2025-02-18' })
  res = await tb('http://localhost/api/reports/trial-balance?end=2025-02-19')
    data = await res.json()
    const exp = data.rows.find((r: any) => r.number === '6000')
    const cash = data.rows.find((r: any) => r.number === '1000')
    expect(exp?.debit || 0).toBeGreaterThanOrEqual(60)
    expect(cash?.credit || 0).toBeGreaterThanOrEqual(60)
    expect(data.balanced).toBe(true)
  })
})
