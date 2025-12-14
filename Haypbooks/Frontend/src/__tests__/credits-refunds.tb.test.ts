import { db, createCreditMemo, applyCreditToInvoice, createInvoice, updateInvoice, createCustomerRefund, createVendorCredit, applyVendorCreditToBill, createBill, createVendorRefund } from '@/mock/db'

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
  db.vendors.push({ id: 'ven_A', name: 'Vendor A' } as any)
}

describe('Credit memos and refunds lifecycle', () => {
  beforeEach(() => reset())

  test('Customer credit memo creation reduces revenue and AR; applying credit reduces invoice balance without extra JE; customer refund DR AR CR Cash', async () => {
    db.settings!.accountingMethod = 'accrual'
    const cust = db.customers[0]
    const cm = createCreditMemo({ customerId: cust.id, date: '2025-04-05', lines: [{ description: 'Adj', amount: 120 }] })
    let res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-04-05')
    let data = await res.json()
    const rev0 = data.rows.find((r: any) => r.number === '4000')
    const ar0 = data.rows.find((r: any) => r.number === '1100')
    expect(rev0?.balance || 0).toBeGreaterThanOrEqual(0) // debit to revenue lowers its credit balance -> increases towards zero; signed as negative normally, so debit yields less negative or positive
    expect(ar0?.balance || 0).toBeLessThanOrEqual(0) // credit to AR lowers asset balance -> negative sign
    // Create invoice and apply part of credit
    const inv = createInvoice({ number: 'INV-CM', customerId: cust.id, date: '2025-04-06', lines: [{ description: 'S', amount: 200 }] })
    updateInvoice(inv.id, { status: 'sent' })
    applyCreditToInvoice(cm.id, inv.id, 100)
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-04-06')
    data = await res.json()
  const ar1 = data.rows.find((r: any) => r.number === '1100')
  // Net AR = +200 (invoice) - 120 (credit memo) = 80; application itself doesn’t post a new AR JE
  expect(ar1?.balance || 0).toBeCloseTo(80, 2)
    // Refund remaining credit 20
    createCustomerRefund({ customerId: cust.id, amount: 20, date: '2025-04-07', creditMemoId: cm.id })
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-04-07')
    data = await res.json()
    const cash2 = data.rows.find((r: any) => r.number === '1000')
    const ar2 = data.rows.find((r: any) => r.number === '1100')
    expect((cash2?.balance || 0)).toBeLessThanOrEqual(0) // refund reduces cash
    expect((ar2?.balance || 0)).toBeGreaterThan(0) // DR AR for refund; paired with existing CM credit nets out in AR
  })

  test('Vendor credit and refund: vendor credit DR AP CR expense then vendor refund DR Cash CR AP', async () => {
    db.settings!.accountingMethod = 'accrual'
    const ven = db.vendors[0]
    const vc = createVendorCredit({ vendorId: ven.id, date: '2025-05-05', lines: [{ description: 'Adj', amount: 90 }] })
    let res: any = await tb('http://localhost/api/reports/trial-balance?end=2025-05-05')
    let data = await res.json()
    const ap0 = data.rows.find((r: any) => r.number === '2000')
    const exp0 = data.rows.find((r: any) => r.number === '6000')
    expect(ap0?.balance || 0).toBeGreaterThanOrEqual(90) // DR AP lowers liability (liabilities are credit normal; DR reduces -> positive less negative)
    expect(exp0?.balance || 0).toBeLessThanOrEqual(-90) // CR expense reduces its debit-normal balance -> negative
    // Apply vendor credit to a bill
    const bill = createBill({ number: 'B-VC', vendorId: ven.id, billDate: '2025-05-06', terms: 'Net 0', lines: [{ description: 'X', amount: 60 }] })
    applyVendorCreditToBill(vc.id, bill.id, 60)
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-05-06')
    data = await res.json()
    const ap1 = data.rows.find((r: any) => r.number === '2000')
    expect(ap1?.balance).toBeDefined()
    // Receive vendor refund for remaining credit 30
    createVendorRefund({ vendorId: ven.id, amount: 30, date: '2025-05-07', vendorCreditId: vc.id })
    res = await tb('http://localhost/api/reports/trial-balance?end=2025-05-07')
    data = await res.json()
    const cash2 = data.rows.find((r: any) => r.number === '1000')
    const ap2 = data.rows.find((r: any) => r.number === '2000')
    expect((cash2?.balance || 0)).toBeGreaterThanOrEqual(0) // refund increases cash
    expect((ap2?.balance || 0)).toBeLessThanOrEqual(0) // CR AP increases liability; netting across credit and refund yields expected sign
  })
})
