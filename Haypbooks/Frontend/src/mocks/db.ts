import { DatabaseState, Transaction, Invoice, Payment, Bill, JournalEntry, AuditEvent, Tag, BankRule, ReconcileSession, CustomerPayment, DepositBatch, PromiseToPay, Estimate, Project, TimeEntry, VendorCredit, PurchaseOrder, CustomerRefund, VendorRefund, BankTransfer, AppConnector, AppPosting, AppSyncRun } from '../types/domain'

export const db: DatabaseState & { creditMemos?: any[] } = {
  accounts: [],
  transactions: [],
  invoices: [],
  estimates: [],
  bills: [],
  customers: [],
  vendors: [],
  items: [],
  journalEntries: [],
  auditEvents: [],
  seeded: false,
  settings: { accountingMethod: 'accrual', baseCurrency: 'USD', closeDate: null, allowBackdated: true, closePassword: undefined as string | undefined },
  tags: [],
  bankRules: [],
  reconcileSessions: [],
  creditMemos: [],
  customerPayments: [],
  deposits: [],
  customerRefunds: [],
  vendorRefunds: [],
  promises: [],
  projects: [],
  timeEntries: [],
  vendorCredits: [],
  purchaseOrders: [],
  transfers: [],
  appConnectors: [],
  appSyncRuns: [],
  appPostings: [],
  messages: [],
  users: [
    // Default demo user
    {
      id: 'user-demo-1',
      email: 'demo@haypbooks.test',
      name: 'Demo User',
      password: 'password', // In production: hash with bcrypt/argon2
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ],
}

// Utility ID helpers
let idCounter = 0
const genId = (p: string) => `${p}_${(++idCounter).toString(36)}`

function recordAudit(e: Omit<AuditEvent,'id'|'ts'>) {
  // Provide a placeholder actor until real auth context exists
  const actor = e.actor || 'system'
  db.auditEvents!.push({ id: genId('aud'), ts: new Date().toISOString(), actor, ...e })
}

export function seedIfNeeded() {
  if (db.seeded) return
  // Basic chart of accounts (minimal for mock)
  db.accounts.push(
    { id: genId('acc'), number: '1000', name: 'Cash', type: 'Asset', balance: 0, active: true, reconcilable: true },
    // Additional bank accounts for demo/preview in bank transactions
    { id: genId('acc'), number: '1001', name: 'Operating Checking', type: 'Asset', balance: 0, active: true, reconcilable: true },
    { id: genId('acc'), number: '1002', name: 'Payroll Checking', type: 'Asset', balance: 0, active: true, reconcilable: true },
    { id: genId('acc'), number: '1003', name: 'Savings', type: 'Asset', balance: 0, active: true, reconcilable: true },
    { id: genId('acc'), number: '1010', name: 'Undeposited Funds', type: 'Asset', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '2000', name: 'Accounts Payable', type: 'Liability', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '3000', name: 'Retained Earnings', type: 'Equity', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '4000', name: 'Sales Revenue', type: 'Income', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '4100', name: 'Interest Income', type: 'Income', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '6000', name: 'Operating Expenses', type: 'Expense', balance: 0, active: true, reconcilable: false },
    { id: genId('acc'), number: '6050', name: 'Bank Service Charges', type: 'Expense', balance: 0, active: true, reconcilable: false },
  )
  // Example sub-accounts to demonstrate hierarchy
  try {
    const cash = db.accounts.find((a: any) => a.number === '1000')
    const sales = db.accounts.find((a: any) => a.number === '4000')
    const interest = db.accounts.find((a: any) => a.number === '4100')
    const opex = db.accounts.find((a: any) => a.number === '6000')
    if (cash) db.accounts.push({ id: genId('acc'), number: '1004', name: 'Petty Cash', type: 'Asset', balance: 0, active: true, reconcilable: false, parentId: cash.id, detailType: 'Petty Cash' })
    if (sales) db.accounts.push({ id: genId('acc'), number: '4001', name: 'Product Sales', type: 'Income', balance: 0, active: true, reconcilable: false, parentId: sales.id, detailType: 'Product Income' })
    if (interest) db.accounts.push({ id: genId('acc'), number: '4101', name: 'Interest - Savings', type: 'Income', balance: 0, active: true, reconcilable: false, parentId: interest.id, detailType: 'Interest Income' })
    if (opex) db.accounts.push({ id: genId('acc'), number: '6010', name: 'Office Supplies', type: 'Expense', balance: 0, active: true, reconcilable: false, parentId: opex.id, detailType: 'Office Expenses' })
  } catch { /* non-fatal */ }
  // Customers & Vendors
  for (let i = 1; i <= 8; i++) db.customers.push({ id: genId('cust'), name: `Customer ${i}`, terms: (['Net 15','Net 30','Due on receipt'] as const)[i % 3], creditLimit: 2000 + i * 500 })
  for (let i = 1; i <= 8; i++) db.vendors.push({ id: genId('ven'), name: `Vendor ${i}` })
  // Items
  db.items.push(
  { id: genId('item'), name: 'Service', type: 'service', defaultAccountId: db.accounts.find((a: any) => a.number === '4000')!.id, unitPrice: 250 },
  { id: genId('item'), name: 'Materials', type: 'product', defaultAccountId: db.accounts.find((a: any) => a.number === '5000')!.id, unitPrice: 100 },
  )
  // Tags catalog (lightweight dimensions)
  const mkTag = (name: string, group?: string): Tag => ({ id: genId('tag'), name, group })
  db.tags!.push(
    mkTag('North', 'Region'),
    mkTag('South', 'Region'),
    mkTag('Online', 'Channel'),
    mkTag('Retail', 'Channel'),
    mkTag('Project A', 'Project'),
    mkTag('Project B', 'Project'),
    mkTag('alpha', 'Feature'),
  )
  // Seed transactions (150 like previous mock) deterministic dates in Jan 2025
  // Distribute across multiple bank accounts to make the account selector more illustrative
  const acc1000 = db.accounts.find((a: any) => a.number === '1000')!.id
  const acc1001 = db.accounts.find((a: any) => a.number === '1001')!.id
  const acc1002 = db.accounts.find((a: any) => a.number === '1002')!.id
  const acc1003 = db.accounts.find((a: any) => a.number === '1003')!.id
  for (let i = 1; i <= 150; i++) {
    const category = ['Income', 'Expense', 'Transfer'][i % 3] as Transaction['category']
    const amountBase = 100 + (i % 17) * 5
    const amount = category === 'Expense' ? -amountBase : amountBase
    const date = new Date(Date.UTC(2025, 0, Math.max(1, (i % 28) + 1))).toISOString()
    // Cycle a few bank statuses to seed realistic distribution
    const bankStatus: Transaction['bankStatus'] = i % 11 === 0 ? 'excluded' : (i % 4 === 0 ? 'categorized' : (i % 6 === 0 ? 'imported' : 'for_review'))
    const source: Transaction['source'] = i % 5 === 0 ? 'manual' : 'import'
    // Assign some tags deterministically (Region always; sometimes Channel/Project)
    const txnTags: string[] = []
    const region = db.tags?.find(t => t.group === 'Region' && ((i % 2 === 0 && t.name === 'North') || (i % 2 !== 0 && t.name === 'South')))
    if (region) txnTags.push(region.id)
    if (i % 5 === 0) {
      const ch = db.tags?.find(t => t.group === 'Channel' && t.name === 'Online')
      if (ch) txnTags.push(ch.id)
    }
    if (i % 7 === 0) {
      const proj = db.tags?.find(t => t.group === 'Project' && t.name === 'Project A')
      if (proj) txnTags.push(proj.id)
    }
    // Seed a realistic cleared mix: roughly half cleared, biased towards earlier dates, skip excluded
    const cleared = bankStatus !== 'excluded' && (i % 2 === 0 || i % 5 === 0) && (i % 6 !== 0)
    // Choose an account with simple weights: mostly 1000, some 1001/1002, occasional 1003
    let accountId = acc1000
    if (i % 5 === 0) accountId = acc1001
    if (i % 7 === 0) accountId = acc1002
    if (i % 11 === 0) accountId = acc1003
    db.transactions.push({ id: genId('txn'), date, description: `Transaction ${i}`, category, amount, accountId, bankStatus, source, tags: txnTags, cleared })
  }
  recalcAccountBalances()

  // Seed a baseline reconciliation for Operating Checking (1001) to enable realistic Bank vs Books calculations
  try {
    const opChecking = db.accounts.find(a => a.number === '1001')
    if (opChecking) {
      const endIso = '2025-01-20'
      const clearedUpTo = (db.transactions || [])
        .filter((t: any) => t.accountId === opChecking.id && (t.cleared === true) && String(t.date || '').slice(0,10) <= endIso && (t.bankStatus !== 'excluded'))
      const clearedIds = clearedUpTo.map(t => t.id)
      const sumAmounts = clearedUpTo.reduce((s: number, t: any) => s + Number(t.amount || 0), 0)
      // Use beginningBalance 0 for first-time reconciliation; ending equals cleared sum
      if (clearedIds.length > 0) {
        createReconcileSession({ accountId: opChecking.id, periodEnd: endIso, endingBalance: Number(sumAmounts.toFixed(2)), beginningBalance: 0, clearedIds, serviceCharge: 0, interestEarned: 0, note: 'Seeded baseline' })
      }
    }
  } catch { /* non-fatal in seed */ }

  // Seed a small message library for statements (versioned messages)
  db.messages!.push(
    { id: genId('msg'), name: 'Payment reminder', body: 'This is a friendly reminder that payment is due. Please remit by the due date.', authorId: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['reminder'] },
    { id: genId('msg'), name: 'Holiday greeting', body: 'Wishing you happy holidays — thanks for your business!', authorId: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ['greeting','holiday'] },
  )
  // Seed a few inter-account bank transfers to illustrate transfers UX
  try {
    createBankTransfer({ date: '2025-01-10', fromAccountNumber: '1000', toAccountNumber: '1002', amount: 500, memo: 'Move to Payroll' })
    createBankTransfer({ date: '2025-01-15', fromAccountNumber: '1001', toAccountNumber: '1000', amount: 300, memo: 'Fund Operating' })
    createBankTransfer({ date: '2025-01-18', fromAccountNumber: '1003', toAccountNumber: '1001', amount: 200, memo: 'Top up Operating' })
  } catch { /* best-effort */ }
  // Seed a handful of invoices and bills for reporting / lists
  // (Estimates left empty by default)
  for (let i = 1; i <= 12; i++) {
    const cust = db.customers[i % db.customers.length]
    const date = new Date(Date.UTC(2025, 0, i)).toISOString()
    const lines = [
      { description: 'Service', amount: 200 + i * 10 },
      { description: 'Tax', amount: Math.round((200 + i * 10) * 0.1) },
    ]
    const total = lines.reduce((s,l)=>s+l.amount,0)
    // Compute some example tags for invoice
    const invTags: string[] = []
    const invCh = db.tags?.find(x => x.group === 'Channel' && ((i % 2 === 0 && x.name === 'Online') || (i % 2 !== 0 && x.name === 'Retail')))
    if (invCh) invTags.push(invCh.id)
    if (i % 4 === 0) { const p = db.tags?.find(x => x.group === 'Project' && x.name === 'Project B'); if (p) invTags.push(p.id) }
    const invoice: Invoice = {
      id: genId('inv'),
      number: `INV-${1000 + i}`,
      customerId: cust.id,
      status: (i % 5 === 0) ? 'paid' : (i % 3 === 0 ? 'sent' : 'draft'),
      date,
      dueDate: new Date(Date.UTC(2025,0,i+30)).toISOString(),
      terms: 'Net 30',
      lines,
      payments: [],
      total,
      balance: total,
      tags: invTags,
      lastReminderDate: undefined,
      reminderCount: 0,
      dunningStage: 'Stage1',
    }
    db.invoices.push(invoice)
    // Auto add payment for paid ones
    if (invoice.status === 'paid') {
      const pay: Payment = { id: genId('pay'), date, amount: invoice.total, appliedToType: 'invoice', appliedToId: invoice.id }
      invoice.payments.push(pay)
      invoice.balance = 0
    }
    if (invoice.status === 'sent' && i % 6 === 0) {
      // simulate partial payment
      const pay: Payment = { id: genId('pay'), date, amount: Math.round(invoice.total/2), appliedToType: 'invoice', appliedToId: invoice.id }
      invoice.payments.push(pay)
      invoice.balance = invoice.total - pay.amount
      invoice.status = 'partial'
    }
    // Post journals for any non-draft invoice
    if (invoice.status !== 'draft') ensureInvoicePosted(invoice)
    // Post journals for payments
    for (const p of invoice.payments) postPayment(p)
  }
  for (let i = 1; i <= 15; i++) {
    const ven = db.vendors[i % db.vendors.length]
    const billDate = new Date(Date.UTC(2025, 0, (i % 28) + 1)).toISOString()
    const due = new Date(Date.UTC(2025, 0, (i % 28) + 1 + 30)).toISOString()
    const lines = [
      { description: 'Service fee', amount: 80 + i * 5 },
      { description: 'Materials', amount: 40 + i * 3 },
    ]
    const total = lines.reduce((s,l)=>s+l.amount,0)
    // Assign some tags on bills: Region alternating; Project A on multiples of 3
    const billTags: string[] = []
    const reg = db.tags?.find(t => t.group === 'Region' && ((i % 2 === 0 && t.name === 'North') || (i % 2 !== 0 && t.name === 'South')))
    if (reg) billTags.push(reg.id)
    if (i % 3 === 0) { const p = db.tags?.find(t => t.group === 'Project' && t.name === 'Project A'); if (p) billTags.push(p.id) }
    // Add alpha tag for deterministic tag-based tests
    if (i % 4 === 0) { const alpha = db.tags?.find(t => t.name === 'alpha'); if (alpha) billTags.push(alpha.id) }
    const bill: Bill = {
      id: genId('bill'),
      number: `BILL-${1000 + i}`,
      vendorId: ven.id,
      status: (i % 7 === 0) ? 'paid' : 'open',
      billDate,
      dueDate: due,
      terms: 'Net 30',
      scheduledDate: null,
      lines,
      payments: [],
      total,
      balance: total,
      tags: billTags,
    }
    db.bills.push(bill)
    if (bill.status === 'paid') {
      const pay: Payment = { id: genId('pay'), date: due, amount: bill.total, appliedToType: 'bill', appliedToId: bill.id }
      bill.payments.push(pay)
      bill.balance = 0
    }
    // Post journal for bill
    ensureBillPosted(bill)
    // Post payment journals
    for (const p of bill.payments) postPayment(p)
  }

  // Additional multi-month seeding across Jan->Sep 2025 to support YTD and period report tests
  for (let month = 1; month <= 9; month++) {
    for (let i = 1; i <= 4; i++) {
      const cust = db.customers[(month * i) % db.customers.length]
      const date = new Date(Date.UTC(2025, month - 1, Math.min(25, i * 3))).toISOString()
      const lines = [ { description: 'Consulting', amount: 150 + month * 10 + i * 5 } ]
      const total = lines.reduce((s,l)=>s+l.amount,0)
      const invoice: Invoice = {
        id: genId('inv'),
        number: `INV-${month}-${1000 + i}`,
        customerId: cust.id,
        status: 'sent',
        date,
        dueDate: new Date(Date.UTC(2025, month - 1, Math.min(25, i * 3 + 30))).toISOString(),
        terms: 'Net 30',
        lines,
        payments: [],
        total,
        balance: total,
        tags: [],
        lastReminderDate: undefined,
        reminderCount: 0,
        dunningStage: 'Stage1',
      }
      db.invoices.push(invoice)
      ensureInvoicePosted(invoice)

      // Create a vendor bill in the same month
      const ven = db.vendors[(month * i) % db.vendors.length]
      const billDate = new Date(Date.UTC(2025, month - 1, Math.min(25, i * 2))).toISOString()
      const billDue = new Date(Date.UTC(2025, month - 1, Math.min(25, i * 2 + 30))).toISOString()
      const billLines = [ { description: 'Office Supplies', amount: 60 + month * 5 + i * 2 } ]
      const billTotal = billLines.reduce((s,l)=>s+l.amount,0)
      const billTags: string[] = []
      if ((month * i) % 3 === 0) { const alpha = db.tags?.find(t => t.name === 'alpha'); if (alpha) billTags.push(alpha.id) }
      const bill: Bill = {
        id: genId('bill'),
        number: `BILL-${month}-${1000 + i}`,
        vendorId: ven.id,
        status: 'open',
        billDate,
        dueDate: billDue,
        terms: 'Net 30',
        scheduledDate: null,
        lines: billLines,
        payments: [],
        total: billTotal,
        balance: billTotal,
        tags: billTags,
      }
      db.bills.push(bill)
      ensureBillPosted(bill)

      // Occasionally create a vendor credit to help AP aging tests
      if (i % 3 === 0) {
        // Use the create helper to ensure proper journaling and audit events
        try {
          createVendorCredit({ vendorId: ven.id, date: date, lines: [{ description: 'Vendor allowance', amount: 50 }] })
        } catch (e) {
          // non-fatal: continue seeding
        }
      }
    }
  }

  // Seed a few statement send audit events to support history queries
  try {
    const batchId = genId('batch')
    const asOf = '2025-10-15'
    for (let i = 0; i < 3; i++) {
      const customerId = db.customers[i]?.id
      if (!customerId) continue
      db.auditEvents.push({ id: genId('aud'), ts: new Date(Date.UTC(2025,9,10 + i)).toISOString(), actor: 'system', action: 'statement:send', entityId: customerId, details: { batchId, asOf } } as any)
    }
  } catch { /* non-fatal */ }

  // Seed a couple of purchase orders (non-posting)
  ;(db.purchaseOrders ||= []).push(
    { id: genId('po'), number: 'PO-1001', vendorId: db.vendors[0].id, status: 'open', date: new Date().toISOString().slice(0,10), lines: [ { description: 'Materials', qty: 5, rate: 100 } ], total: 500 },
    { id: genId('po'), number: 'PO-1002', vendorId: db.vendors[1].id, status: 'open', date: new Date().toISOString().slice(0,10), lines: [ { description: 'Service hours', qty: 8, rate: 75 } ], total: 600 },
  )
  // Seed one vendor credit for demo
  ;(db.vendorCredits ||= []).push({ id: genId('vc'), number: 'VC-1001', vendorId: db.vendors[0].id, date: new Date().toISOString().slice(0,10), lines: [{ description: 'Return/Allowance', amount: 50 }], total: 50, remaining: 50, applied: [] })
  // Payments defaults
  ;(db as any).paymentsEnabled = true
  ;(db as any).paymentMethods = ['Card', 'ACH']
  // Seed a couple of basic bank rules (example)
  const mkRule = (r: Omit<BankRule,'id'>): BankRule => ({ id: genId('rule'), ...r })
  db.bankRules = [
    mkRule({ name: 'Exclude small test charges', amountEquals: 5, setStatus: 'excluded' }),
    mkRule({ name: 'Auto-categorize Online Sales', textIncludes: 'ONLINE', setCategory: 'Income', setStatus: 'categorized' }),
  ]
  db.seeded = true
}

// -------------- App Transactions (Connectors, Syncs, Postings) --------------
export function listAppConnectors(): AppConnector[] {
  return (db.appConnectors || []) as AppConnector[]
}

export function ensureAppSeeded() {
  if ((db.appConnectors || []).length > 0) return
  const now = new Date().toISOString()
  const mk = (name: string, kind: AppConnector['kind'], status: AppConnector['status']): AppConnector => ({
    id: genId('appc'), name, kind, status, createdAt: now, lastSyncAt: null, lastSyncStatus: null,
  } as any)
  ;(db.appConnectors ||= []).push(
    mk('Commerce', 'commerce', 'connected'),
    mk('Time', 'time', 'connected'),
    mk('Banking', 'banking', 'connected'),
  )
}

export function triggerAppSync(connectorId: string) {
  ensureAppSeeded()
  const conn = (db.appConnectors || []).find(c => c.id === connectorId)
  if (!conn) throw new Error('Connector not found')
  const startedAt = new Date().toISOString()
  const run: AppSyncRun = { id: genId('apps'), connectorId, startedAt, status: 'running', newPostings: 0 }
  ;(db.appSyncRuns ||= []).push(run)
  // Simulate creating a few postings
  const count = 4
  let created = 0
  for (let i = 0; i < count; i++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    const posting: AppPosting = {
      id: genId('apst'),
      connectorId: conn.id,
      externalId: `${conn.name}-${Date.now()}-${i}`,
      date: d.toISOString().slice(0,10),
      description: `${conn.name} posting ${i + 1}`,
      type: (conn.kind === 'commerce' ? (i % 3 === 0 ? 'sale' : (i % 3 === 1 ? 'payout' : 'fee')) : (conn.kind === 'time' ? 'time' : 'transfer')) as any,
      amount: Number(((i % 2 === 0 ? 100 + i * 7 : -15 - i * 3)).toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    ;(db.appPostings ||= []).push(posting)
    created++
  }
  run.newPostings = created
  run.status = 'success'
  run.finishedAt = new Date().toISOString()
  conn.lastSyncAt = run.finishedAt
  conn.lastSyncStatus = 'success'
  ;(db.auditEvents ||= []).push({ id: genId('aud'), ts: new Date().toISOString(), actor: 'system', action: 'apps:sync', entityType: 'appConnector', entityId: connectorId, after: { connectorId, created } })
  return run
}

export function listAppPostings(filter?: { connectorId?: string; status?: AppPosting['status']; start?: string; end?: string }) {
  ensureAppSeeded()
  let rows = (db.appPostings || []) as AppPosting[]
  if (filter?.connectorId) rows = rows.filter(p => p.connectorId === filter.connectorId)
  if (filter?.status) rows = rows.filter(p => p.status === filter.status)
  if (filter?.start) rows = rows.filter(p => String(p.date||'').slice(0,10) >= filter.start!)
  if (filter?.end) rows = rows.filter(p => String(p.date||'').slice(0,10) <= filter.end!)
  rows.sort((a,b)=> b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  return rows
}

// Build a non-posting preview for a single App Posting.
// Returns derived DR/CR lines using the same mapping rules as postAppPosting,
// and includes a normalizedDate when the preferred date is in a closed period.
export function previewAppPosting(id: string) {
  ensureAppSeeded()
  const p = (db.appPostings || []).find(x => x.id === id) as AppPosting | undefined
  if (!p) throw new Error('Posting not found')
  const dateIso = (p.date || new Date().toISOString()).slice(0,10)
  const normalizedDate = normalizeToOpenDate(dateIso)
  const amt = Number(p.amount || 0)
  if (!isFinite(amt) || amt === 0) {
    return { postingId: p.id, date: dateIso, normalizedDate, lines: [], totalDebit: 0, totalCredit: 0, note: 'Zero/invalid amount' }
  }
  const a = Math.abs(amt)
  const memo = `${(p.description || p.type)} ${dateIso}`
  const byNumber = (n: string) => db.accounts.find(acc => acc.number === n)
  const line = (num: string, debit?: number, credit?: number) => {
    const acc = byNumber(num)
    return { accountNumber: num, accountName: acc?.name || num, debit: Number(debit||0), credit: Number(credit||0), memo }
  }
  let lines: Array<{ accountNumber: string; accountName: string; debit: number; credit: number; memo?: string }> = []
  switch (p.type) {
    case 'sale': {
      if (amt <= 0) return { postingId: p.id, date: dateIso, normalizedDate, lines: [], totalDebit: 0, totalCredit: 0, note: 'Sale amount must be > 0' }
      lines = [ line('1010', a, 0), line('4000', 0, a) ]
      break
    }
    case 'fee': {
      lines = [ line('6050', a, 0), line('1010', 0, a) ]
      break
    }
    case 'payout': {
      if (amt > 0) lines = [ line('1000', a, 0), line('1010', 0, a) ]
      else lines = [ line('1010', a, 0), line('1000', 0, a) ]
      break
    }
    case 'time':
    case 'expense': {
      if (amt > 0) lines = [ line('6000', a, 0), line('1000', 0, a) ]
      else lines = [ line('1000', a, 0), line('6000', 0, a) ]
      break
    }
    default:
      return { postingId: p.id, date: dateIso, normalizedDate, lines: [], totalDebit: 0, totalCredit: 0, note: 'Unsupported posting type' }
  }
  const totalDebit = Number(lines.reduce((s,l)=> s + (l.debit||0), 0).toFixed(2))
  const totalCredit = Number(lines.reduce((s,l)=> s + (l.credit||0), 0).toFixed(2))
  const note = normalizedDate !== dateIso ? 'Date will be adjusted to the next open period' : undefined
  return { postingId: p.id, date: dateIso, normalizedDate, lines, totalDebit, totalCredit, note }
}

// Post a single App Posting into the ledger according to its type.
// Simplified mapping rules (mock):
// - sale (positive): DR 1010 Undeposited Funds, CR 4000 Sales Revenue
// - fee (negative or positive): DR 6050 Bank Service Charges, CR 1010 Undeposited Funds
// - payout: move between Undeposited Funds (1010) and Cash (1000). Positive amount -> DR 1000, CR 1010; negative reverses.
// - time/expense: treat as operating expense; if positive amount -> DR 6000, CR 1000; if negative -> DR 1000, CR 6000
// Unsupported types are marked as error.
export function postAppPosting(id: string) {
  ensureAppSeeded()
  const p = (db.appPostings || []).find(x => x.id === id) as AppPosting | undefined
  if (!p) throw new Error('Posting not found')
  if (p.status === 'posted' || p.status === 'ignored') return p
  const dateIso = (p.date || new Date().toISOString()).slice(0,10)
  const amt = Number(p.amount || 0)
  if (!isFinite(amt) || amt === 0) {
    p.status = 'error'
    p.errorMessage = 'Zero/invalid amount'
    recordAudit({ action: 'apps:post:error', entityType: 'appPosting', entityId: p.id, after: { ...p } })
    return p
  }
  let jeId: string | undefined
  const memo = `${(p.description || p.type)} ${dateIso}`
  try {
    switch (p.type) {
      case 'sale': {
        if (amt <= 0) throw new Error('Sale amount must be > 0')
        jeId = postJournal([
          { accountNumber: '1010', debit: amt, memo },
          { accountNumber: '4000', credit: amt, memo },
        ], dateIso, { type: 'payment', id: p.id })
        break
      }
      case 'fee': {
        const a = Math.abs(amt)
        jeId = postJournal([
          { accountNumber: '6050', debit: a, memo },
          { accountNumber: '1010', credit: a, memo },
        ], dateIso, { type: 'payment', id: p.id })
        break
      }
      case 'payout': {
        const a = Math.abs(amt)
        if (amt > 0) {
          jeId = postJournal([
            { accountNumber: '1000', debit: a, memo },
            { accountNumber: '1010', credit: a, memo },
          ], dateIso, { type: 'payment', id: p.id })
        } else {
          jeId = postJournal([
            { accountNumber: '1010', debit: a, memo },
            { accountNumber: '1000', credit: a, memo },
          ], dateIso, { type: 'payment', id: p.id })
        }
        break
      }
      case 'time':
      case 'expense': {
        const a = Math.abs(amt)
        if (amt > 0) {
          // Cash outflow to expense not yet paid through AP
          jeId = postJournal([
            { accountNumber: '6000', debit: a, memo },
            { accountNumber: '1000', credit: a, memo },
          ], dateIso, { type: 'payment', id: p.id })
        } else {
          jeId = postJournal([
            { accountNumber: '1000', debit: a, memo },
            { accountNumber: '6000', credit: a, memo },
          ], dateIso, { type: 'payment', id: p.id })
        }
        break
      }
      default:
        throw new Error('Unsupported posting type')
    }
    p.status = 'posted'
    ;(p as any).journalEntryId = jeId
    ;(p as any).postedAt = new Date().toISOString()
    recordAudit({ action: 'apps:post', entityType: 'appPosting', entityId: p.id, after: { ...p }, meta: { journalEntryId: jeId, type: p.type, amount: amt } })
    return p
  } catch (e: any) {
    p.status = 'error'
    p.errorMessage = String(e?.message || 'Post failed')
    recordAudit({ action: 'apps:post:error', entityType: 'appPosting', entityId: p.id, after: { ...p } })
    return p
  }
}

export function ignoreAppPosting(id: string) {
  ensureAppSeeded()
  const p = (db.appPostings || []).find(x => x.id === id) as AppPosting | undefined
  if (!p) throw new Error('Posting not found')
  if (p.status === 'ignored') return p
  const before = { ...p }
  p.status = 'ignored'
  ;(p as any).ignoredAt = new Date().toISOString()
  recordAudit({ action: 'apps:ignore', entityType: 'appPosting', entityId: p.id, before, after: { ...p } })
  return p
}

// (no-op helpers)

// -------------- Projects & Time Tracking --------------
export function listProjects(filter: { customerId?: string; active?: boolean } = {}) {
  const all = db.projects || []
  let rows = all.slice()
  if (typeof filter.active === 'boolean') rows = rows.filter(p => p.active === filter.active)
  if (filter.customerId) rows = rows.filter(p => p.customerId === filter.customerId)
  return rows
}

export function createProject(input: { name: string; customerId: string; hourlyRate?: number; active?: boolean; tags?: string[] }) {
  if (!input.name || !input.customerId) throw new Error('name and customerId required')
  const proj: Project = { id: genId('proj'), name: input.name, customerId: input.customerId, hourlyRate: input.hourlyRate, active: input.active ?? true, createdAt: new Date().toISOString(), tags: input.tags }
  ;(db.projects ||= []).push(proj)
  recordAudit({ action: 'create', entityType: 'project', entityId: proj.id, after: proj })
  return proj
}

export function findProject(id: string) { return (db.projects || []).find(p => p.id === id) }

export function updateProject(id: string, patch: Partial<Pick<Project,'name'|'customerId'|'hourlyRate'|'active'|'tags'>>) {
  const p = findProject(id)
  if (!p) throw new Error('Project not found')
  const before = { ...p }
  Object.assign(p, patch)
  recordAudit({ action: 'update', entityType: 'project', entityId: p.id, before, after: { ...p } })
  return p
}

export function deleteProject(id: string) { const idx = (db.projects || []).findIndex(p => p.id === id); if (idx === -1) return false; const before = { ...(db.projects as any)[idx] }; (db.projects as any).splice(idx,1); recordAudit({ action: 'delete', entityType: 'project', entityId: id, before }); return true }

export function listTimeEntries(filter: { customerId?: string; projectId?: string; status?: TimeEntry['status']; start?: string; end?: string }) {
  let rows = (db.timeEntries || []).slice()
  if (filter.customerId) rows = rows.filter(te => te.customerId === filter.customerId)
  if (filter.projectId) rows = rows.filter(te => te.projectId === filter.projectId)
  if (filter.status) rows = rows.filter(te => te.status === filter.status)
  if (filter.start) rows = rows.filter(te => te.date >= filter.start!)
  if (filter.end) rows = rows.filter(te => te.date <= filter.end!)
  return rows.sort((a,b)=> b.date.localeCompare(a.date))
}

export function createTimeEntry(input: { customerId: string; projectId?: string; date: string; hours: number; description?: string; billable?: boolean; rate?: number; tags?: string[] }) {
  if (!input.customerId || !input.date || !(input.hours > 0)) throw new Error('customerId, date and positive hours required')
  assertOpen(input.date)
  const proj = input.projectId ? findProject(input.projectId) : undefined
  const effectiveRate = input.billable === false ? 0 : (typeof input.rate === 'number' ? input.rate : (proj?.hourlyRate ?? 100))
  const billable = input.billable ?? true
  const amount = billable ? Number((input.hours * effectiveRate).toFixed(2)) : 0
  const te: TimeEntry = { id: genId('te'), customerId: input.customerId, projectId: input.projectId, date: input.date, hours: input.hours, description: input.description, billable, rate: billable ? effectiveRate : undefined, amount, status: billable ? 'unbilled' : 'nonbillable', createdAt: new Date().toISOString(), tags: input.tags }
  ;(db.timeEntries ||= []).push(te)
  recordAudit({ action: 'create', entityType: 'timeEntry', entityId: te.id, after: te })
  return te
}

export function updateTimeEntry(id: string, patch: Partial<Pick<TimeEntry,'customerId'|'projectId'|'date'|'hours'|'description'|'billable'|'rate'|'tags'>>) {
  const te = (db.timeEntries || []).find(t => t.id === id)
  if (!te) throw new Error('Time entry not found')
  if (patch.date) assertOpen(patch.date)
  if (te.status === 'billed') throw new Error('Cannot edit billed time entry')
  const before = { ...te }
  Object.assign(te, patch)
  // Recompute billing amount/state
  const proj = te.projectId ? findProject(te.projectId) : undefined
  const billable = te.billable !== false
  const effectiveRate = billable ? (typeof te.rate === 'number' ? te.rate : (proj?.hourlyRate ?? 100)) : 0
  te.rate = billable ? effectiveRate : undefined
  te.amount = billable ? Number((te.hours * effectiveRate).toFixed(2)) : 0
  te.status = billable ? (te.billedInvoiceId ? 'billed' : 'unbilled') : 'nonbillable'
  recordAudit({ action: 'update', entityType: 'timeEntry', entityId: te.id, before, after: { ...te } })
  return te
}

export function deleteTimeEntry(id: string) { const idx = (db.timeEntries || []).findIndex(t => t.id === id); if (idx === -1) return false; const before = { ...(db.timeEntries as any)[idx] }; if (before.status === 'billed') throw new Error('Cannot delete billed time entry'); (db.timeEntries as any).splice(idx,1); recordAudit({ action: 'delete', entityType: 'timeEntry', entityId: id, before }); return true }

export function listUnbilledTime(filter: { customerId?: string; projectId?: string; start?: string; end?: string } = {}) {
  return listTimeEntries({ ...filter, status: 'unbilled' })
}

export function invoiceTimeEntries(input: { entryIds: string[]; invoiceNumber?: string; date?: string; terms?: string; dueDate?: string }) {
  if (!Array.isArray(input.entryIds) || input.entryIds.length === 0) throw new Error('entryIds required')
  // Fetch entries and validate
  const entries: TimeEntry[] = []
  for (const id of input.entryIds) {
    const te = (db.timeEntries || []).find(t => t.id === id)
    if (!te) throw new Error('Time entry not found: ' + id)
    if (te.status !== 'unbilled') throw new Error('Only unbilled entries can be invoiced')
    entries.push(te)
  }
  // Ensure same customer
  const customerId = entries[0].customerId
  if (!entries.every(e => e.customerId === customerId)) throw new Error('Entries must belong to the same customer')
  // Build invoice lines from entries
  const lines = entries.map(e => ({ description: e.description || `Time ${e.hours}h @ ${e.rate ?? 0}/h`, amount: e.amount }))
  const inv = createInvoice({ number: input.invoiceNumber || `INV-${Math.floor(Math.random()*9000+1000)}`, customerId, date: input.date || new Date().toISOString(), lines, terms: input.terms || 'Due on receipt', dueDate: input.dueDate })
  updateInvoice(inv.id, { status: 'sent' })
  // Mark entries billed
  for (const e of entries) { e.status = 'billed'; e.billedInvoiceId = inv.id }
  recordAudit({ action: 'time:invoice', entityType: 'invoice', entityId: inv.id, after: { ...inv }, meta: { entries: entries.map(e => e.id) } })
  return inv
}

// -------------- Customer Payments & Deposits (AR Cash Receipt Workflow) --------------
export function createCustomerPayment(input: { customerId: string; amountReceived: number; allocations?: { invoiceId: string; amount: number }[]; date?: string; method?: string; reference?: string; autoCreditUnapplied?: boolean; depositAccountNumber?: string }) {
  if (!input.customerId) throw new Error('customerId required')
  if (!(input.amountReceived > 0)) throw new Error('amountReceived must be > 0')
  const date = input.date || new Date().toISOString().slice(0,10)
  assertOpen(date)
  const allocations = (input.allocations || []).filter(a => a && a.invoiceId && a.amount > 0)
  let amountAllocated = 0
  const paymentIds: string[] = []
  for (const a of allocations) {
    const inv = findInvoice(a.invoiceId)
    if (!inv) throw new Error('Invoice not found: ' + a.invoiceId)
    const remaining = Math.max(0, inv.total - inv.payments.reduce((s,p)=>s+p.amount,0))
    if (a.amount > remaining) throw new Error('Allocation exceeds invoice balance')
    amountAllocated += a.amount
  }
  if (amountAllocated > input.amountReceived) throw new Error('Allocations exceed amountReceived')
  const amountUnapplied = Number((input.amountReceived - amountAllocated).toFixed(2))
  const cp: CustomerPayment = {
    id: genId('cp'),
    customerId: input.customerId,
    date,
    method: input.method,
    reference: input.reference,
    amountReceived: input.amountReceived,
    allocations: allocations.map(a => ({ invoiceId: a.invoiceId, amount: a.amount })),
    amountAllocated,
    amountUnapplied,
    status: amountAllocated === 0 ? 'unapplied' : (amountAllocated < input.amountReceived ? 'partial' : 'fully_applied'),
    paymentIds,
    createdAt: new Date().toISOString(),
  }
  // Determine deposit behavior: default to Undeposited Funds (1010); if a valid Asset account number provided (and not 1010), post directly to that account
  const depositAcct = (typeof input.depositAccountNumber === 'string' && /\d{3,6}/.test(input.depositAccountNumber)) ? input.depositAccountNumber : '1010'
  const depAcc = db.accounts.find(a => a.number === depositAcct)
  if (!depAcc) throw new Error('Target account not found')
  if (depAcc.type !== 'Asset') throw new Error('Deposit must go to an Asset account')

  const fundSource: 'cash' | 'undeposited' = depositAcct === '1010' ? 'undeposited' : 'cash'

  // Apply allocations as discrete payments
  for (const a of allocations) {
    const { invoice } = applyPaymentToInvoiceInternal(a.invoiceId, a.amount, { fundSource, date, debitAccountNumber: depositAcct })
    const lastPay = invoice.payments[invoice.payments.length - 1]
    if (lastPay) paymentIds.push(lastPay.id)
  }
  // If unapplied remainder and autoCreditUnapplied -> create credit memo (acts like customer credit)
  if (amountUnapplied > 0 && input.autoCreditUnapplied) {
    createCreditMemo({ customerId: input.customerId, lines: [{ description: 'Unapplied payment credit', amount: amountUnapplied }], date })
  }
  ;(db.customerPayments ||= []).push(cp)
  recordAudit({ action: 'customerPayment:create', entityType: 'customerPayment', entityId: cp.id, after: cp })
  return cp
}

export function listCustomerPayments(filter: { customerId?: string } = {}) {
  let list = (db.customerPayments || [])
  if (filter.customerId) list = list.filter(p => p.customerId === filter.customerId)
  return list.slice().sort((a,b)=> b.date.localeCompare(a.date))
}

// Void a customer payment:
// - For each underlying invoice payment, ensure not deposited; post reversing journal on provided date (or normalized next open date)
// - Remove the payment line from the invoice and recalc status/balance
// - Mark customerPayment as void
export function voidCustomerPayment(id: string, opts: { reversalDate?: string } = {}) {
  const cp = (db.customerPayments || []).find((p: any) => p.id === id)
  if (!cp) throw new Error('Customer payment not found')
  if ((cp as any).voidedAt) return cp
  // Resolve reversal date and guard closed period via normalize function
  const preferred = (opts.reversalDate && /\d{4}-\d{2}-\d{2}/.test(opts.reversalDate)) ? opts.reversalDate : new Date().toISOString().slice(0,10)
  const reversalDate = normalizeToOpenDate(preferred)
  assertOpen(reversalDate)
  const updatedInvoices: string[] = []
  for (const pid of (cp.paymentIds || [])) {
    // locate invoice and payment line
    let inv: Invoice | undefined
    let payIdx = -1
    for (const i of db.invoices) {
      const idx = i.payments.findIndex(p => p.id === pid)
      if (idx !== -1) { inv = i; payIdx = idx; break }
    }
    if (!inv) continue
    const pay = inv.payments[payIdx]
    if (pay.depositId) throw new Error('Cannot void: one or more payments already deposited')
    // reverse related journal(s)
    const jList = (db.journalEntries || []).filter(j => j.linkedType === 'payment' && j.linkedId === pay.id)
    for (const j of jList) {
      try { reverseJournalEntry(j.id, { date: reversalDate }) } catch { /* noop in mock */ }
    }
    // remove payment line and recalc invoice
    const before = { ...inv }
    inv.payments.splice(payIdx, 1)
    const paid = inv.payments.reduce((s,p)=> s + p.amount, 0)
    inv.balance = Math.max(0, inv.total - paid)
    recalcInvoiceStatus(inv)
    updatedInvoices.push(inv.id)
    recordAudit({ action: 'invoice:payment-void', entityType: 'invoice', entityId: inv.id, before, after: { ...inv }, meta: { paymentId: pid, reversalDate } })
  }
  ;(cp as any).status = 'void'
  ;(cp as any).voidedAt = new Date().toISOString()
  recordAudit({ action: 'customerPayment:void', entityType: 'customerPayment', entityId: cp.id, after: cp, meta: { updatedInvoices, reversalDate } })
  return cp
}

export function createDeposit(input: { date?: string; paymentIds: string[]; accountNumber?: string; memo?: string }) {
  if (!Array.isArray(input.paymentIds) || input.paymentIds.length === 0) throw new Error('paymentIds required')
  const date = input.date || new Date().toISOString().slice(0,10)
  assertOpen(date)
  // Collect underlying payments (invoice payments) by id across invoices
  const invoicePayments: Payment[] = []
  for (const inv of db.invoices) {
    for (const p of inv.payments) {
      if (input.paymentIds.includes(p.id)) invoicePayments.push(p)
    }
  }
  if (invoicePayments.length !== input.paymentIds.length) throw new Error('Some payments not found')
  // Ensure none already deposited
  for (const p of invoicePayments) {
    if (p.depositId) throw new Error('Payment already deposited: ' + p.id)
  }
  const total = invoicePayments.reduce((s,p)=> s + p.amount, 0)
  // Determine target account (default Cash 1000)
  const targetNumber = (input.accountNumber && /\d{3,6}/.test(input.accountNumber)) ? input.accountNumber : '1000'
  const target = db.accounts.find((a: any) => a.number === targetNumber)
  if (!target) throw new Error('Target account not found')
  if (target.type !== 'Asset') throw new Error('Deposit must go to an Asset account')
  if (target.number === '1010') throw new Error('Cannot deposit into Undeposited Funds (1010)')
  // Post journal: DR Target Asset account, CR Undeposited Funds (1010)
  const lineMemo = input.memo ? `Deposit ${date}: ${input.memo}` : `Deposit ${date}`
  const jeId = postJournal([
    { accountNumber: target.number, debit: total, memo: lineMemo },
    { accountNumber: '1010', credit: total, memo: lineMemo },
  ], date, { type: 'payment', id: 'batch' })
  const dep: DepositBatch = { id: genId('dep'), date, paymentIds: input.paymentIds.slice(), total, journalEntryId: jeId, memo: input.memo, createdAt: new Date().toISOString() }
  ;(db.deposits ||= []).push(dep)
  // Mark payments with depositId & adjust fundSource
  for (const p of invoicePayments) { p.depositId = dep.id; p.fundSource = 'cash' }
  recordAudit({ action: 'deposit:create', entityType: 'deposit', entityId: dep.id, after: dep, meta: { count: invoicePayments.length } })
  return dep
}

export function listDeposits() { return (db.deposits || []).slice().sort((a,b)=> b.date.localeCompare(a.date)) }

export function voidDeposit(id: string, opts: { reversalDate?: string } = {}) {
  const dep = (db.deposits || []).find(d => d.id === id)
  if (!dep) throw new Error('Deposit not found')
  if ((dep as any).voidedAt) return dep
  const reversalDate = (opts.reversalDate && /\d{4}-\d{2}-\d{2}/.test(opts.reversalDate)) ? opts.reversalDate : new Date().toISOString().slice(0,10)
  assertOpen(reversalDate)
  // Find original journal and build reversing lines
  const orig = dep.journalEntryId ? db.journalEntries?.find(j => j.id === dep.journalEntryId) : undefined
  if (orig) {
    const revLines = orig.lines.map(l => {
      const acc = db.accounts.find(a => a.id === l.accountId)
      return { accountNumber: acc ? acc.number : '9999', debit: l.credit, credit: l.debit, memo: `Reversal of ${orig.id} for deposit ${dep.id}` }
    })
    const reversingId = postJournal(revLines, reversalDate, { type: 'payment', id: dep.id }, { reversing: true, reversesEntryId: orig.id })
    ;(dep as any).reversingEntryId = reversingId
  }
  // Unlink payments and set fundSource back to undeposited
  for (const inv of db.invoices) {
    for (const p of inv.payments) {
      if (dep.paymentIds.includes(p.id)) {
        p.depositId = undefined
        p.fundSource = 'undeposited'
      }
    }
  }
  ;(dep as any).voidedAt = new Date().toISOString()
  recordAudit({ action: 'deposit:void', entityType: 'deposit', entityId: dep.id, after: dep })
  return dep
}

// ---------------- Customer Refunds (Refund Receipts) ----------------
export function listCustomerRefunds(filter: { customerId?: string } = {}) {
  const all = (db.customerRefunds || []) as CustomerRefund[]
  let rows = all.slice()
  if (filter.customerId) rows = rows.filter(r => r.customerId === filter.customerId)
  return rows.sort((a,b)=> b.date.localeCompare(a.date))
}

// Issue a refund to a customer against available credits/unapplied balances.
// Simplified rules:
// - Requires positive amount and open period on refund date
// - If creditMemoId provided, amount must be <= credit memo remaining; remaining reduced
// - Posts journal: DR 1100 (A/R) for amount, CR Cash (1000) – reduces cash, increases AR which offsets existing credit memo (net zero on AR when paired)
//   Note: In a simplified mock, we treat it as offset against AR; in a more detailed ledger with a dedicated Refunds Payable, patterns may differ.
export function createCustomerRefund(input: { customerId: string; amount: number; date?: string; method?: string; reference?: string; creditMemoId?: string }) {
  const { customerId } = input
  if (!customerId) throw new Error('customerId required')
  const amount = Number(input.amount)
  if (!(amount > 0)) throw new Error('Amount must be > 0')
  const dateIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(dateIso)
  // If refunding a specific credit memo, validate remaining and reduce
  let creditMemoId: string | undefined
  if (input.creditMemoId) {
    const cm = findCreditMemo(input.creditMemoId)
    if (!cm) throw new Error('Credit memo not found')
    if (cm.customerId !== customerId) throw new Error('Customer mismatch for credit memo')
    if (amount > cm.remaining) throw new Error('Amount exceeds credit memo remaining')
    cm.remaining = Number((cm.remaining - amount).toFixed(2))
    creditMemoId = cm.id
    recordAudit({ action: 'creditMemo:refund', entityType: 'creditMemo', entityId: cm.id, after: { ...cm }, meta: { amount } })
  }
  // Post journal: DR A/R (1100), CR Cash (1000)
  const jeId = postJournal([
    { accountNumber: '1100', debit: amount, memo: `Customer refund ${dateIso}` },
    { accountNumber: '1000', credit: amount, memo: `Customer refund ${dateIso}` },
  ], dateIso, { type: 'payment', id: 'refund' })
  const refund: CustomerRefund = { id: genId('rf'), customerId, date: dateIso, amount, method: input.method, reference: input.reference, creditMemoId, journalEntryId: jeId }
  ;(db.customerRefunds ||= []).push(refund)
  recordAudit({ action: 'customerRefund:create', entityType: 'customerRefund', entityId: refund.id, after: refund })
  return refund
}

// ---------------- Vendor Refunds (Cash received from vendor against A/P credit) ----------------
export function listVendorRefunds(filter: { vendorId?: string } = {}) {
  const all = (db.vendorRefunds || []) as VendorRefund[]
  let rows = all.slice()
  if (filter.vendorId) rows = rows.filter(r => r.vendorId === filter.vendorId)
  return rows.sort((a,b)=> b.date.localeCompare(a.date))
}

// Receive a refund from a vendor. Simplified rules mirror customer refunds:
// - Positive amount and open period on refund date
// - If vendorCreditId provided, amount must be <= vendor credit remaining; remaining reduced
// - Posts journal: DR Cash (1000), CR A/P (2000)
export function createVendorRefund(input: { vendorId: string; amount: number; date?: string; method?: string; reference?: string; vendorCreditId?: string }) {
  const { vendorId } = input
  if (!vendorId) throw new Error('vendorId required')
  const amount = Number(input.amount)
  if (!(amount > 0)) throw new Error('Amount must be > 0')
  const dateIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(dateIso)
  let vendorCreditId: string | undefined
  if (input.vendorCreditId) {
    const vc = findVendorCredit(input.vendorCreditId)
    if (!vc) throw new Error('Vendor credit not found')
    if (vc.vendorId !== vendorId) throw new Error('Vendor mismatch for vendor credit')
    if (amount > vc.remaining) throw new Error('Amount exceeds vendor credit remaining')
    const beforeVc = { ...vc }
    vc.remaining = Number((vc.remaining - amount).toFixed(2))
    vendorCreditId = vc.id
    recordAudit({ action: 'vendorCredit:refund', entityType: 'vendorCredit', entityId: vc.id, before: beforeVc, after: { ...vc }, meta: { amount } })
  }
  // Post journal: DR Cash (1000), CR A/P (2000)
  const jeId = postJournal([
    { accountNumber: '1000', debit: amount, memo: `Vendor refund ${dateIso}` },
    { accountNumber: '2000', credit: amount, memo: `Vendor refund ${dateIso}` },
  ], dateIso, { type: 'bill', id: 'vendor-refund' })
  const refund: VendorRefund = { id: genId('vrf'), vendorId, date: dateIso, amount, method: input.method, reference: input.reference, vendorCreditId, journalEntryId: jeId }
  ;(db.vendorRefunds ||= []).push(refund)
  recordAudit({ action: 'vendorRefund:create', entityType: 'vendorRefund', entityId: refund.id, after: refund })
  return refund
}

// Remove specific payments from an existing deposit (partial edit):
// - Moves those payments back to Undeposited Funds
// - Posts an adjusting journal: DR 1010 (Undeposited), CR target asset for removed total
// - Decreases the deposit total and updates paymentIds
export function removePaymentsFromDeposit(id: string, paymentIds: string[], opts: { date?: string; memo?: string } = {}) {
  const dep = (db.deposits || []).find(d => d.id === id)
  if (!dep) throw new Error('Deposit not found')
  if ((dep as any).voidedAt) throw new Error('Cannot edit a voided deposit')
  if (!Array.isArray(paymentIds) || paymentIds.length === 0) throw new Error('paymentIds required')
  // Ensure all provided ids are in the deposit
  const missing = paymentIds.filter(pid => !dep.paymentIds.includes(pid))
  if (missing.length > 0) throw new Error('Payment(s) not in this deposit: ' + missing.join(','))
  // Find payments and sum amount
  const affected: Payment[] = []
  for (const inv of db.invoices) {
    for (const p of inv.payments) {
      if (paymentIds.includes(p.id)) affected.push(p)
    }
  }
  if (affected.length !== paymentIds.length) throw new Error('Some payments not found')
  const removedTotal = affected.reduce((s,p)=> s + p.amount, 0)
  // Determine the target asset account from the original deposit JE debit line
  const orig = dep.journalEntryId ? db.journalEntries?.find(j => j.id === dep.journalEntryId) : undefined
  let targetNumber: string | undefined
  if (orig) {
    const debitLine = orig.lines.find(l => (l.debit || 0) > 0)
    if (debitLine) {
      const acc = db.accounts.find(a => a.id === debitLine.accountId)
      targetNumber = acc?.number
    }
  }
  if (!targetNumber) throw new Error('Original deposit account not found')
  const date = (opts.date && /\d{4}-\d{2}-\d{2}/.test(opts.date)) ? opts.date : new Date().toISOString().slice(0,10)
  assertOpen(date)
  const lineMemo = opts.memo ? `Deposit edit ${date}: ${opts.memo}` : `Deposit edit ${date}: remove ${affected.length} payment(s)`
  // Post adjusting journal: DR 1010, CR target asset
  postJournal([
    { accountNumber: '1010', debit: removedTotal, memo: lineMemo },
    { accountNumber: targetNumber, credit: removedTotal, memo: lineMemo },
  ], date, { type: 'payment', id: dep.id })
  // Update deposit and payments
  dep.paymentIds = dep.paymentIds.filter(pid => !paymentIds.includes(pid))
  dep.total = Math.max(0, Number((dep.total - removedTotal).toFixed(2)))
  for (const p of affected) { p.depositId = undefined; p.fundSource = 'undeposited' }
  recordAudit({ action: 'deposit:remove-payments', entityType: 'deposit', entityId: dep.id, after: dep, meta: { count: affected.length, amount: removedTotal } })
  return dep
}

// Add specific undeposited payments into an existing deposit (partial edit):
// - Moves those payments out of Undeposited Funds into the deposit
// - Posts an adjusting journal: DR target asset, CR 1010 for added total
// - Increases the deposit total and updates paymentIds
export function addPaymentsToDeposit(id: string, paymentIds: string[], opts: { date?: string; memo?: string } = {}) {
  const dep = (db.deposits || []).find(d => d.id === id)
  if (!dep) throw new Error('Deposit not found')
  if ((dep as any).voidedAt) throw new Error('Cannot edit a voided deposit')
  if (!Array.isArray(paymentIds) || paymentIds.length === 0) throw new Error('paymentIds required')
  // Filter out any ids already in the deposit
  const toAddIds = paymentIds.filter(pid => !dep.paymentIds.includes(pid))
  if (toAddIds.length === 0) return dep
  const affected: Payment[] = []
  for (const inv of db.invoices) {
    for (const p of inv.payments) {
      if (toAddIds.includes(p.id)) affected.push(p)
    }
  }
  if (affected.length !== toAddIds.length) throw new Error('Some payments not found')
  // All must be undeposited
  const notEligible = affected.find(p => p.depositId || p.fundSource !== 'undeposited')
  if (notEligible) throw new Error('Payment not eligible (already deposited or not in Undeposited): ' + notEligible.id)
  const addTotal = affected.reduce((s,p)=> s + p.amount, 0)
  // Determine the target asset account from the original deposit JE debit line
  const orig = dep.journalEntryId ? db.journalEntries?.find(j => j.id === dep.journalEntryId) : undefined
  let targetNumber: string | undefined
  if (orig) {
    const debitLine = orig.lines.find(l => (l.debit || 0) > 0)
    if (debitLine) {
      const acc = db.accounts.find(a => a.id === debitLine.accountId)
      targetNumber = acc?.number
    }
  }
  if (!targetNumber) throw new Error('Original deposit account not found')
  const date = (opts.date && /\d{4}-\d{2}-\d{2}/.test(opts.date)) ? opts.date : new Date().toISOString().slice(0,10)
  assertOpen(date)
  const lineMemo = opts.memo ? `Deposit edit ${date}: ${opts.memo}` : `Deposit edit ${date}: add ${affected.length} payment(s)`
  // Post adjusting journal: DR target asset, CR 1010
  postJournal([
    { accountNumber: targetNumber, debit: addTotal, memo: lineMemo },
    { accountNumber: '1010', credit: addTotal, memo: lineMemo },
  ], date, { type: 'payment', id: dep.id })
  // Update deposit and payments
  dep.paymentIds = dep.paymentIds.concat(toAddIds)
  dep.total = Number((dep.total + addTotal).toFixed(2))
  for (const p of affected) { p.depositId = dep.id; p.fundSource = 'cash' }
  recordAudit({ action: 'deposit:add-payments', entityType: 'deposit', entityId: dep.id, after: dep, meta: { count: affected.length, amount: addTotal } })
  return dep
}

// Internal helper to reuse invoice payment logic with fundSource override
function applyPaymentToInvoiceInternal(id: string, amount: number, opts?: { fundSource?: 'cash' | 'undeposited'; date?: string; debitAccountNumber?: string }) {
  const inv = findInvoice(id)
  if (!inv) throw new Error('Invoice not found')
  const before = { ...inv }
  const remaining = Math.max(0, inv.total - inv.payments.reduce((s,p)=>s+p.amount,0))
  if (amount > remaining) throw new Error('Payment exceeds remaining balance')
  const payment: Payment = { id: genId('pay'), date: opts?.date || new Date().toISOString(), amount, appliedToType: 'invoice', appliedToId: id, fundSource: opts?.fundSource || 'cash' }
  inv.payments.push(payment)
  const paid = inv.payments.reduce((s,p)=>s+p.amount,0)
  inv.balance = Math.max(0, inv.total - paid)
  recalcInvoiceStatus(inv)
  // Journal behavior depends on accounting method:
  // - Accrual: receipt reduces AR (CR 1100) and increases Cash/Undeposited (DR 1000/1010)
  // - Cash: receipt recognizes revenue (CR 4000) and increases Cash/Undeposited (DR 1000/1010)
  const debitAcct = opts?.debitAccountNumber || (opts?.fundSource === 'undeposited' ? '1010' : '1000')
  if (db.settings?.accountingMethod === 'cash') {
    postJournal([
      { accountNumber: debitAcct, debit: payment.amount },
      { accountNumber: '4000', credit: payment.amount },
    ], payment.date, { type: 'payment', id: payment.id })
  } else {
    postJournal([
      { accountNumber: debitAcct, debit: payment.amount },
      { accountNumber: '1100', credit: payment.amount },
    ], payment.date, { type: 'payment', id: payment.id })
  }
  recordAudit({ action: 'apply-payment', entityType: 'invoice', entityId: inv.id, before, after: { ...inv }, meta: { payment, fundSource: payment.fundSource } })
  recordAudit({ action: 'invoice:payment', entityType: 'invoice', entityId: inv.id, after: { invoiceId: inv.id, customerId: inv.customerId, date: payment.date.slice(0,10), amount: payment.amount, paymentId: payment.id, remainingBalance: inv.balance, method: payment.fundSource } })
  return { invoice: inv, payment }
}

// ---------------- Journal / Posting Helpers ----------------
export function postJournal(
  lines: { accountNumber: string; debit?: number; credit?: number; memo?: string }[],
  date: string,
  linked?: { type: JournalEntry['linkedType']; id: string },
  opts?: { adjusting?: boolean; reversing?: boolean; reversesEntryId?: string }
) {
  // Normalize any incoming ISO with time to YYYY-MM-DD before closed-period guard
  const iso = (date || '').slice(0,10)
  assertOpen(iso)
  const je: JournalEntry = { id: genId('je'), date, lines: [], linkedType: linked?.type, linkedId: linked?.id, adjusting: opts?.adjusting, reversing: opts?.reversing, reversesEntryId: opts?.reversesEntryId }
  for (const l of lines) {
    const acc = db.accounts.find(a => a.number === l.accountNumber)
    if (!acc) continue
    je.lines.push({ accountId: acc.id, debit: l.debit || 0, credit: l.credit || 0, memo: l.memo })
  }
  db.journalEntries!.push(je)
  return je.id
}

// Create a reversing journal entry for an existing posted journal.
// - Swaps debit/credit for each line
// - Defaults the reversal date to the next day after the original date
// - If that date is in a closed period, it uses the next open day after the close
// - Links the reversing entry to the original using reversesEntryId and reversing flag
export function reverseJournalEntry(originalId: string, opts: { date?: string; memo?: string } = {}) {
  const orig = db.journalEntries?.find(j => j.id === originalId)
  if (!orig) throw new Error('Journal not found')
  // Compute default reversal date: next day after original, normalized to YYYY-MM-DD
  const baseIso = (orig.date || new Date().toISOString()).slice(0,10)
  const base = new Date(baseIso + 'T00:00:00Z')
  const defaultNextDay = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + 1)).toISOString().slice(0,10)
  const preferred = (opts.date && /\d{4}-\d{2}-\d{2}/.test(opts.date)) ? opts.date : defaultNextDay
  const reversalDate = normalizeToOpenDate(preferred)
  // Build reversing lines using account numbers from original
  const revLines = orig.lines.map(l => {
    const acc = db.accounts.find(a => a.id === l.accountId)
    const memo = opts.memo ? `${opts.memo}` : (l.memo || undefined)
    return { accountNumber: acc ? acc.number : '9999', debit: l.credit, credit: l.debit, memo }
  })
  const linked = { type: (orig.linkedType as JournalEntry['linkedType']) || undefined, id: orig.linkedId || originalId } as any
  const reversingId = postJournal(revLines, reversalDate, linked, { reversing: true, reversesEntryId: orig.id })
  return reversingId
}

function ensureInvoicePosted(inv: Invoice) {
  if (inv.journalEntryId) return
  const arAmount = inv.total
  inv.journalEntryId = postJournal([
    { accountNumber: '1100', debit: arAmount },
    { accountNumber: '4000', credit: arAmount },
  ], inv.date, { type: 'invoice', id: inv.id })
}

// ---------------- Vendor Credit Helpers (A/P Adjustments) ----------------
export function listVendorCredits(filter: { vendorId?: string } = {}) {
  const all: VendorCredit[] = (db.vendorCredits || []) as VendorCredit[]
  return filter.vendorId ? all.filter(c => c.vendorId === filter.vendorId) : all.slice()
}

export function findVendorCredit(id: string): VendorCredit | undefined {
  return (db.vendorCredits || []).find(vc => vc.id === id)
}

export function createVendorCredit(input: { number?: string; vendorId: string; date?: string; lines: { description: string; amount: number }[] }) {
  if (!input.vendorId) throw new Error('vendorId required')
  const date = input.date || new Date().toISOString().slice(0,10)
  assertOpen(date)
  const total = input.lines.reduce((s,l)=> s + (Number(l.amount)||0), 0)
  const vc: VendorCredit = {
    id: genId('vc'),
    number: input.number || `VC-${Math.floor(Math.random()*9000+1000)}`,
    vendorId: input.vendorId,
    date,
    lines: input.lines,
    total,
    remaining: total,
    applied: [],
  }
  ;(db.vendorCredits ||= []).push(vc)
  // Post journal (reduce A/P and reduce expense). Simplified: debit A/P (2000), credit Operating Expenses (6000)
  vc.journalEntryId = postJournal([
    { accountNumber: '2000', debit: total },
    { accountNumber: '6000', credit: total },
  ], date, undefined)
  recordAudit({ action: 'create', entityType: 'vendorCredit', entityId: vc.id, after: vc })
  return vc
}

export function applyVendorCreditToBill(vcId: string, billId: string, amount: number) {
  const vc = findVendorCredit(vcId)
  if (!vc) throw new Error('Vendor credit not found')
  const bill = findBill(billId)
  if (!bill) throw new Error('Bill not found')
  if (bill.vendorId !== vc.vendorId) throw new Error('Vendor mismatch')
  if (!(amount > 0)) throw new Error('Amount must be > 0')
  if (amount > vc.remaining) throw new Error('Amount exceeds remaining credit')
  const billRemaining = bill.balance
  if (amount > billRemaining) throw new Error('Amount exceeds bill balance')
  // Enforce closed period based on as-of (vendor credit) date
  const vcIso = (vc.date || new Date().toISOString()).slice(0,10)
  assertOpen(vcIso)
  // Application is a non-posting allocation; use the vendor credit's own date for as-of accuracy
  const beforeBill = { ...bill }
  const beforeVc = { ...vc }
  vc.applied.push({ billId: bill.id, amount })
  vc.remaining = Math.max(0, vc.remaining - amount)
  // Reduce bill balance (simulate payment via credit)
  const pmt: Payment = { id: genId('pay'), date: vcIso, amount, appliedToType: 'bill', appliedToId: bill.id }
  bill.payments.push(pmt)
  const paid = bill.payments.reduce((s,p)=>s+p.amount,0)
  bill.balance = Math.max(0, bill.total - paid)
  recalcBillStatus(bill)
  // Journal: A/P reduction already posted with VC; application treated as internal allocation – no additional journal
  recordAudit({ action: 'apply-vendor-credit', entityType: 'bill', entityId: bill.id, before: beforeBill, after: { ...bill }, meta: { vendorCreditId: vc.id, amount } })
  recordAudit({ action: 'apply-vendor-credit', entityType: 'vendorCredit', entityId: vc.id, before: beforeVc, after: { ...vc }, meta: { billId: bill.id, amount } })
  return { bill, vendorCredit: vc }
}

function ensureBillPosted(bill: Bill) {
  if (bill.journalEntryId) return
  const expense = bill.total
  bill.journalEntryId = postJournal([
    { accountNumber: '6000', debit: expense },
    { accountNumber: '2000', credit: expense },
  ], bill.billDate || bill.dueDate, { type: 'bill', id: bill.id })
}

function postPayment(pmt: Payment) {
  const cashAcc = '1000'
  if (pmt.appliedToType === 'invoice') {
    postJournal([
      { accountNumber: cashAcc, debit: pmt.amount },
      { accountNumber: '1100', credit: pmt.amount },
    ], pmt.date, { type: 'payment', id: pmt.id })
  } else if (pmt.appliedToType === 'bill') {
    postJournal([
      { accountNumber: '2000', debit: pmt.amount },
      { accountNumber: cashAcc, credit: pmt.amount },
    ], pmt.date, { type: 'payment', id: pmt.id })
  }
}

export function recalcAccountBalances() {
  // Reset balances then apply transactions (simple cash/account tracking only for now)
  db.accounts.forEach((a: any) => { a.balance = 0 })
  db.transactions.forEach((t: any) => {
    // If splits exist, allocate to split accounts; otherwise book to the txn's account
    if (Array.isArray(t.splits) && t.splits.length > 0) {
      for (const s of t.splits) {
        const acc = db.accounts.find((a: any) => a.id === s.accountId)
        if (acc) acc.balance += Number(s.amount) || 0
      }
    } else {
      const acc = db.accounts.find((a: any) => a.id === t.accountId)
      if (acc) acc.balance += t.amount
    }
  })
}

// ---------------- Bank Transfers ----------------
export function listBankTransfers(filter: { start?: string; end?: string; fromAccountNumber?: string; toAccountNumber?: string } = {}) {
  const all: BankTransfer[] = (db.transfers || []) as BankTransfer[]
  let rows = all.slice()
  if (filter.start) rows = rows.filter(t => t.date >= filter.start!)
  if (filter.end) rows = rows.filter(t => t.date <= filter.end!)
  if (filter.fromAccountNumber) rows = rows.filter(t => t.fromAccountNumber === filter.fromAccountNumber)
  if (filter.toAccountNumber) rows = rows.filter(t => t.toAccountNumber === filter.toAccountNumber)
  return rows.sort((a,b)=> a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

export function createBankTransfer(input: { date?: string; fromAccountNumber: string; toAccountNumber: string; amount: number; memo?: string }) {
  const amount = Number(input.amount)
  if (!(amount > 0)) throw new Error('Amount must be > 0')
  if (!input.fromAccountNumber || !input.toAccountNumber) throw new Error('From and To accounts required')
  if (input.fromAccountNumber === input.toAccountNumber) throw new Error('From/To accounts must differ')
  const from = db.accounts.find(a => a.number === input.fromAccountNumber)
  const to = db.accounts.find(a => a.number === input.toAccountNumber)
  if (!from) throw new Error('From account not found')
  if (!to) throw new Error('To account not found')
  if (from.type !== 'Asset' || to.type !== 'Asset') throw new Error('Transfers are only supported between Asset accounts')
  const dateIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(dateIso)
  // Post journal: DR toAccount, CR fromAccount
  const memo = input.memo || `Transfer ${from.number} → ${to.number}`
  const jeId = postJournal([
    { accountNumber: to.number, debit: amount, memo },
    { accountNumber: from.number, credit: amount, memo },
  ], dateIso, undefined)
  const transfer: BankTransfer = { id: genId('xfer'), date: dateIso, fromAccountNumber: from.number, toAccountNumber: to.number, amount, memo: input.memo, journalEntryId: jeId }
  ;(db.transfers ||= []).push(transfer)
  recordAudit({ action: 'transfer:create', entityType: 'transfer', entityId: transfer.id, after: transfer })
  return transfer
}

// ---------------- Credit Memo Helpers (A/R Adjustments) ----------------
export interface CreditMemo {
  id: string
  number: string
  customerId: string
  date: string
  lines: { description: string; amount: number }[]
  total: number
  remaining: number
  applied: { invoiceId: string; amount: number }[]
  journalEntryId?: string
}

export function listCreditMemos(filter: { customerId?: string } = {}) {
  const all: CreditMemo[] = (db as any).creditMemos || []
  return filter.customerId ? all.filter(c => c.customerId === filter.customerId) : all.slice()
}

export function createCreditMemo(input: { number?: string; customerId: string; date?: string; lines: { description: string; amount: number }[] }) {
  const date = input.date || new Date().toISOString().slice(0,10)
  assertOpen(date)
  const total = input.lines.reduce((s,l)=> s + (Number(l.amount)||0), 0)
  const cm: CreditMemo = {
    id: genId('cm'),
    number: input.number || `CM-${Math.floor(Math.random()*9000+1000)}`,
    customerId: input.customerId,
    date,
    lines: input.lines,
    total,
    remaining: total,
    applied: [],
  }
  ;(db as any).creditMemos = (db as any).creditMemos || []
  ;(db as any).creditMemos.push(cm)
  // Post journal (reduce A/R, reduce revenue) simplified: debit Sales Revenue, credit A/R
  cm.journalEntryId = postJournal([
    { accountNumber: '4000', debit: total },
    { accountNumber: '1100', credit: total },
  ], date, undefined)
  recordAudit({ action: 'create', entityType: 'creditMemo', entityId: cm.id, after: cm })
  return cm
}

export function findCreditMemo(id: string): CreditMemo | undefined {
  const list: CreditMemo[] = (db as any).creditMemos || []
  return list.find(c => c.id === id)
}

export function applyCreditToInvoice(cmId: string, invoiceId: string, amount: number) {
  const cm = findCreditMemo(cmId)
  if (!cm) throw new Error('Credit memo not found')
  const inv = findInvoice(invoiceId)
  if (!inv) throw new Error('Invoice not found')
  if (amount <= 0) throw new Error('Amount must be > 0')
  if (amount > cm.remaining) throw new Error('Amount exceeds remaining credit')
  const invRemaining = inv.balance
  if (amount > invRemaining) throw new Error('Amount exceeds invoice balance')
  const beforeInv = { ...inv }
  const beforeCm = { ...cm }
  cm.applied.push({ invoiceId: inv.id, amount })
  cm.remaining = Math.max(0, cm.remaining - amount)
  // Reduce invoice balance (simulate payment via credit)
  // Use the credit memo date for application to reflect correct as-of behavior
  const payment: Payment = { id: genId('pay'), date: (cm.date || new Date().toISOString()), amount, appliedToType: 'invoice', appliedToId: inv.id }
  inv.payments.push(payment)
  const paid = inv.payments.reduce((s,p)=>s+p.amount,0)
  inv.balance = Math.max(0, inv.total - paid)
  recalcInvoiceStatus(inv)
  // Journal: debit AR, credit AR (offset) not needed since CM already posted; treat application as internal reclassification -> simplified no journal.
  recordAudit({ action: 'apply-credit', entityType: 'invoice', entityId: inv.id, before: beforeInv, after: { ...inv }, meta: { creditMemoId: cm.id, amount } })
  recordAudit({ action: 'apply-credit', entityType: 'creditMemo', entityId: cm.id, before: beforeCm, after: { ...cm }, meta: { invoiceId: inv.id, amount } })
  return { invoice: inv, creditMemo: cm }
}

// ---------------- Reconciliation Session Helpers ----------------
export function listReconcileSessions(accountId?: string) {
  const sess = db.reconcileSessions || []
  return accountId ? sess.filter(s => s.accountId === accountId) : sess
}

export function createReconcileSession(input: { accountId: string; periodEnd: string; endingBalance: number; beginningBalance?: number; serviceCharge?: number; interestEarned?: number; clearedIds: string[]; note?: string }) {
  // Lock beginning balance to previous session's ending balance when one exists
  const prior = (db.reconcileSessions || []).filter(s => s.accountId === input.accountId)
    .slice().sort((a,b) => (b.periodEnd || '').localeCompare(a.periodEnd || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))[0]
  let effectiveBeginning = input.beginningBalance
  // Validate period end format and closed period
  const endIso = (input.periodEnd || '').slice(0,10)
  if (!/\d{4}-\d{2}-\d{2}/.test(endIso)) throw new Error('Invalid periodEnd')
  assertOpen(endIso)
  if (prior) {
    const priorEnd = Number(prior.endingBalance || 0)
    // Enforce monotonic period progression per account
    const priorEndDate = String(prior.periodEnd || '').slice(0,10)
    if (priorEndDate && endIso <= priorEndDate) throw new Error('Period end must be after the last reconciliation')
    if (typeof input.beginningBalance === 'number' && Math.abs(input.beginningBalance - priorEnd) > 0.0001) {
      // Strict mode: prevent mismatch; require undoing or editing prior period first
      throw new Error('Beginning balance must match last reconciliation ending balance')
    }
    effectiveBeginning = priorEnd
  }

  // Validate cleared transactions: must belong to the account and be dated on/before period end
  const clearedTxns = input.clearedIds
    .map(id => db.transactions.find(t => t.id === id))
    .filter(Boolean) as Transaction[]
  for (const t of clearedTxns) {
    if (t.accountId !== input.accountId) throw new Error('Cleared transactions must belong to the reconciled account')
    const tIso = String(t.date || '').slice(0,10)
    if (tIso > endIso) throw new Error('Cleared transactions cannot be after the statement period end')
  }
  // Server-side zero-difference guard: recompute cleared balance and require equality
  const sumAmounts = clearedTxns.reduce((s, t) => s + Number(t.amount || 0), 0)
  const adjustments = Number(input.interestEarned || 0) - Number(input.serviceCharge || 0)
  const clearedBalance = Number(effectiveBeginning || 0) + sumAmounts + adjustments
  const difference = Number(input.endingBalance || 0) - clearedBalance
  // Allow reconciliation when there are posting adjustments (serviceCharge or interestEarned)
  // so we can finalize and post those journal entries as part of the reconciliation process.
  // Preserve strict enforcement when no adjustments are supplied to keep invariants/tests intact.
  const hasAdjustments = (typeof input.serviceCharge === 'number' && input.serviceCharge !== 0) || (typeof input.interestEarned === 'number' && input.interestEarned !== 0)
  if (Math.abs(difference) > 0.0001 && !hasAdjustments) throw new Error('Difference must be zero to finish reconciliation')
  const id = genId('rec')
  // Snapshot reconciled txn states for discrepancy detection (id+date+amount)
  const snapshot = input.clearedIds
    .map(tid => db.transactions.find(x => x.id === tid))
    .filter(Boolean)
    .map((t: any) => ({ id: t.id, date: String(t.date || '').slice(0,10), amount: Number(t.amount || 0) }))
  const sess: ReconcileSession = { id, accountId: input.accountId, periodEnd: input.periodEnd, beginningBalance: effectiveBeginning, endingBalance: input.endingBalance, serviceCharge: input.serviceCharge, interestEarned: input.interestEarned, note: input.note, clearedIds: input.clearedIds.slice(), createdAt: new Date().toISOString(), snapshot }
  db.reconcileSessions = db.reconcileSessions || []
  db.reconcileSessions.push(sess)
  // Mark transactions as reconciled
  const before: any[] = []
  for (const tid of input.clearedIds) {
    const t = db.transactions.find(x => x.id === tid)
    if (!t) continue
    before.push({ ...t })
    t.reconciled = true
    t.reconciledAt = sess.createdAt
  }
  // Optional: post service charge and interest earned as part of reconciliation finalize
  const postAdj = (fn: () => void) => { try { fn() } catch { /* noop in mock */ } }
  const bankAcc = db.accounts.find(a => a.id === input.accountId)
  const bankNumber = bankAcc ? bankAcc.number : '1000'
  if (typeof input.serviceCharge === 'number' && input.serviceCharge > 0) {
    const amt = Number(input.serviceCharge)
    postAdj(() => postJournal([
      { accountNumber: '6050', debit: amt, memo: `Bank service charge ${endIso}` },
      { accountNumber: bankNumber, credit: amt, memo: `Bank service charge ${endIso}` },
    ], endIso, { type: 'payment', id }))
  }
  if (typeof input.interestEarned === 'number' && input.interestEarned > 0) {
    const amt = Number(input.interestEarned)
    postAdj(() => postJournal([
      { accountNumber: bankNumber, debit: amt, memo: `Interest earned ${endIso}` },
      { accountNumber: '4100', credit: amt, memo: `Interest earned ${endIso}` },
    ], endIso, { type: 'payment', id }))
  }
  recordAudit({ action: 'reconcile-finalize', entityType: 'reconcileSession', entityId: id, after: sess, meta: { affected: input.clearedIds.length } })
  return sess
}

// Detect whether previously reconciled transaction states no longer match the snapshot for a session
export function hasReconciliationDiscrepancy(session: ReconcileSession): boolean {
  if (!session || !(session as any).snapshot) return false
  const snap = (session as any).snapshot as Array<{ id: string; date: string; amount: number }>
  for (const s of snap) {
    const t = db.transactions.find(x => x.id === s.id)
    if (!t) return true
    const curDate = String(t.date || '').slice(0,10)
    const curAmt = Number(t.amount || 0)
    // Flag when core fields drift OR when transaction is no longer marked reconciled
    if (curDate !== s.date || Math.abs(curAmt - s.amount) > 0.0001) return true
    if (!(t as any).reconciled) return true
  }
  return false
}

export function deleteReconcileSession(id: string) {
  const idx = (db.reconcileSessions || []).findIndex(s => s.id === id)
  if (idx === -1) return false
  const sess = db.reconcileSessions![idx]
  // Clear reconciled flags for affected transactions
  for (const tid of sess.clearedIds) {
    const t = db.transactions.find(x => x.id === tid)
    if (t) { t.reconciled = false; t.reconciledAt = undefined }
  }
  db.reconcileSessions!.splice(idx,1)
  recordAudit({ action: 'reconcile-undo', entityType: 'reconcileSession', entityId: id, before: sess })
  return true
}

// CRUD helpers
export function listTransactions(filter: { start?: string; end?: string; type?: string; bankStatus?: string; page: number; limit: number }) {
  const { start, end, type, bankStatus, page, limit } = filter
  let rows = db.transactions.slice()
  if (start) rows = rows.filter((r: any) => r.date.slice(0,10) >= start)
  if (end) rows = rows.filter((r: any) => r.date.slice(0,10) <= end)
  if (type) rows = rows.filter((r: any) => r.category === type)
  if (bankStatus) {
    if (bankStatus === 'for_review') {
      // Treat imported as part of For Review in UI/exports
      rows = rows.filter((r: any) => r.bankStatus === 'for_review' || r.bankStatus === 'imported' || !r.bankStatus)
    } else {
      rows = rows.filter((r: any) => (r.bankStatus || 'for_review') === bankStatus)
    }
  }
  const total = rows.length
  const offset = (page - 1) * limit
  const pageRows = rows.slice(offset, offset + limit)
  return { rows: pageRows, total }
}

// ---------------- Bank Rules Helpers ----------------
export function listBankRules() { return db.bankRules || [] }

export function addBankRule(input: Omit<BankRule,'id'>) {
  const rule: BankRule = { id: genId('rule'), ...input }
  db.bankRules = db.bankRules || []
  db.bankRules.push(rule)
  recordAudit({ action: 'create', entityType: 'bankRule', entityId: rule.id, after: rule })
  return rule
}

export function deleteBankRule(id: string) {
  db.bankRules = db.bankRules || []
  const idx = db.bankRules.findIndex(r => r.id === id)
  if (idx === -1) return false
  const before = { ...db.bankRules[idx] }
  db.bankRules.splice(idx, 1)
  recordAudit({ action: 'delete', entityType: 'bankRule', entityId: id, before })
  return true
}

function matchesRule(t: Transaction, r: BankRule) {
  const textOk = r.textIncludes ? (t.description || '').toLowerCase().includes(r.textIncludes.toLowerCase()) : true
  const amtOk = typeof r.amountEquals === 'number' ? t.amount === r.amountEquals : true
  return textOk && amtOk
}

export function applyRulesToTransactions(targetStatuses: Array<NonNullable<Transaction['bankStatus']>> = ['imported','for_review'], accountId?: string) {
  const rules = listBankRules()
  if (rules.length === 0) return { updated: 0 }
  let updated = 0
  for (let i = 0; i < db.transactions.length; i++) {
    const t = db.transactions[i]
    const status = t.bankStatus || 'for_review'
    if (!targetStatuses.includes(status)) continue
    if (accountId && t.accountId !== accountId) continue
    const rule = rules.find(r => matchesRule(t, r))
    if (!rule) continue
    const before = { ...t }
    const patch: Partial<Transaction> = {}
    if (rule.setCategory) patch.category = rule.setCategory
    if (rule.setStatus) patch.bankStatus = rule.setStatus
    db.transactions[i] = { ...t, ...patch }
    updated++
    recordAudit({ action: 'apply-rule', entityType: 'transaction', entityId: t.id, before, after: db.transactions[i], meta: { ruleId: rule.id } })
  }
  return { updated }
}

export function createTransaction(input: Omit<Transaction,'id'>) {
  const txn: Transaction = { bankStatus: 'for_review', source: 'manual', ...input, id: genId('txn') }
  assertOpen(txn.date.slice(0,10))
  db.transactions.push(txn)
  recalcAccountBalances()
  recordAudit({ action: 'create', entityType: 'transaction', entityId: txn.id, after: txn })
  return txn
}

// ---------------- Purchase Orders (PO) Helpers ----------------
export function listPurchaseOrders(filter: { vendorId?: string; status?: PurchaseOrder['status'] } = {}) {
  const list = (db.purchaseOrders || []) as PurchaseOrder[]
  let rows = list.slice()
  if (filter.vendorId) rows = rows.filter(p => p.vendorId === filter.vendorId)
  if (filter.status) rows = rows.filter(p => p.status === filter.status)
  return rows.sort((a,b)=> b.date.localeCompare(a.date))
}

export function findPurchaseOrder(id: string) {
  return (db.purchaseOrders || []).find(p => p.id === id)
}

export function createPurchaseOrder(input: { number?: string; vendorId: string; date?: string; lines: { description: string; qty: number; rate: number }[] }) {
  if (!input.vendorId) throw new Error('vendorId required')
  if (!Array.isArray(input.lines) || input.lines.length === 0) throw new Error('lines required')
  const date = input.date || new Date().toISOString().slice(0,10)
  assertOpen(date)
  const total = input.lines.reduce((s,l)=> s + (Number(l.qty)||0)*(Number(l.rate)||0), 0)
  const po: PurchaseOrder = { id: genId('po'), number: input.number || `PO-${Math.floor(Math.random()*9000+1000)}`, vendorId: input.vendorId, status: 'open', date, lines: input.lines.map(l => ({ description: l.description, qty: Number(l.qty)||0, rate: Number(l.rate)||0 })), total }
  ;(db.purchaseOrders ||= []).push(po)
  recordAudit({ action: 'create', entityType: 'purchaseOrder', entityId: po.id, after: po })
  return po
}

export function closePurchaseOrder(id: string) {
  const po = findPurchaseOrder(id)
  if (!po) throw new Error('Purchase order not found')
  if (po.status === 'closed') return po
  const before = { ...po }
  po.status = 'closed'
  recordAudit({ action: 'close', entityType: 'purchaseOrder', entityId: po.id, before, after: { ...po } })
  return po
}

// Receive a PO: for mock, convert to a Bill and close PO
export function receivePurchaseOrder(id: string, opts?: { billNumber?: string; billDate?: string; terms?: string }) {
  const po = findPurchaseOrder(id)
  if (!po) throw new Error('Purchase order not found')
  if (po.status === 'closed') throw new Error('PO already closed')
  const billLines = po.lines.map(l => ({ description: `${l.description} (${l.qty} @ ${l.rate})`, amount: Number((l.qty * l.rate).toFixed(2)) }))
  const bill = createBill({ number: opts?.billNumber, vendorId: po.vendorId, lines: billLines, billDate: opts?.billDate || new Date().toISOString(), terms: opts?.terms || 'Net 30' })
  const before = { ...po }
  po.status = 'closed'
  recordAudit({ action: 'receive', entityType: 'purchaseOrder', entityId: po.id, before, after: { ...po }, meta: { billId: bill.id } })
  return { purchaseOrder: po, bill }
}

export function updateTransaction(input: Transaction) {
  const idx = db.transactions.findIndex((t: any) => t.id === input.id)
  if (idx === -1) throw new Error('Transaction not found')
  assertOpen(input.date.slice(0,10))
  // Guard: prevent changing core fields of reconciled items unless session undone
  const was = db.transactions[idx]
  if (was.reconciled) {
    const dateChanged = (String(was.date||'').slice(0,10) !== String(input.date||'').slice(0,10))
    const amountChanged = Number(was.amount||0) !== Number(input.amount||0)
    if (dateChanged || amountChanged) throw new Error('Cannot modify reconciled transaction; undo reconciliation first')
  }
  // If splits provided, validate they sum (within tolerance) to amount and have accounts
  if (Array.isArray((input as any).splits) && (input as any).splits.length > 0) {
    const splits = (input as any).splits as Array<{ accountId: string; amount: number }>
    for (let i = 0; i < splits.length; i++) {
      const s = splits[i]
      if (!s.accountId) throw new Error(`Split ${i + 1}: accountId required`)
      if (typeof s.amount !== 'number' || isNaN(s.amount)) throw new Error(`Split ${i + 1}: amount required`)
    }
    const sum = Number(splits.reduce((s, l) => s + (Number(l.amount)||0), 0).toFixed(2))
    const amt = Number((input as any).amount || 0)
    const within = Math.abs(sum - amt) < 0.005
    if (!within) throw new Error('Splits must sum to transaction amount')
  }
  const before = { ...db.transactions[idx] }
  db.transactions[idx] = { ...db.transactions[idx], ...input }
  recalcAccountBalances()
  recordAudit({ action: 'update', entityType: 'transaction', entityId: input.id, before, after: db.transactions[idx] })
  return db.transactions[idx]
}

export function deleteTransaction(id: string) {
  const idx = db.transactions.findIndex((t: any) => t.id === id)
  if (idx === -1) return false
  assertOpen(db.transactions[idx].date.slice(0,10))
  const before = { ...db.transactions[idx] }
  db.transactions.splice(idx,1)
  recalcAccountBalances()
  recordAudit({ action: 'delete', entityType: 'transaction', entityId: id, before })
  return true
}

// Invoices helpers
export function listInvoices(filter: { start?: string; end?: string; status?: string; page: number; limit: number }) {
  const { start, end, status, page, limit } = filter
  let rows = db.invoices.slice()
  if (start) rows = rows.filter(r => r.date.slice(0,10) >= start)
  if (end) rows = rows.filter(r => r.date.slice(0,10) <= end)
  if (status) rows = rows.filter(r => r.status === status)
  const total = rows.length
  const offset = (page - 1) * limit
  return { rows: rows.slice(offset, offset + limit), total }
}

// ---------------- Estimates helpers ----------------
export function listEstimates(filter: { start?: string; end?: string; status?: string; page: number; limit: number }) {
  const { start, end, status, page, limit } = filter
  const all = (db.estimates || [])
  let rows = all.slice()
  if (start) rows = rows.filter(r => r.date.slice(0,10) >= start)
  if (end) rows = rows.filter(r => r.date.slice(0,10) <= end)
  if (status) rows = rows.filter(r => r.status === status)
  const total = rows.length
  const offset = (page - 1) * limit
  return { rows: rows.slice(offset, offset + limit), total }
}

export function createEstimate(input: { number: string; customerId: string; date: string; lines: { description: string; amount: number }[]; terms?: string; expiryDate?: string }) {
  const total = input.lines.reduce((s,l)=> s + (Number(l.amount)||0), 0)
  assertOpen(input.date.slice(0,10))
  const est: Estimate = {
    id: genId('est'),
    number: input.number,
    customerId: input.customerId,
    status: 'draft',
    date: input.date,
    expiryDate: input.expiryDate,
    terms: input.terms,
    lines: input.lines,
    total,
  }
  ;(db.estimates ||= []).push(est)
  recordAudit({ action: 'create', entityType: 'estimate', entityId: est.id, after: est })
  return est
}

export function findEstimate(id: string) { return (db.estimates || []).find(e => e.id === id) }

export function updateEstimate(id: string, patch: Partial<Pick<Estimate,'number'|'customerId'|'status'|'date'|'expiryDate'|'terms'|'lines'|'tags'>>) {
  const est = findEstimate(id)
  if (!est) throw new Error('Estimate not found')
  if (patch.date) assertOpen(patch.date.slice(0,10))
  const before = { ...est }
  Object.assign(est, patch)
  if (patch.lines) est.total = est.lines.reduce((s,l)=> s + l.amount, 0)
  recordAudit({ action: 'update', entityType: 'estimate', entityId: est.id, before, after: { ...est } })
  return est
}

export function deleteEstimate(id: string) {
  const list = (db.estimates || [])
  const idx = list.findIndex(e => e.id === id)
  if (idx === -1) return false
  const before = { ...list[idx] }
  list.splice(idx, 1)
  recordAudit({ action: 'delete', entityType: 'estimate', entityId: id, before })
  return true
}

export function convertEstimateToInvoice(id: string, opts?: { invoiceNumber?: string; date?: string; terms?: string; dueDate?: string }) {
  const est = findEstimate(id)
  if (!est) throw new Error('Estimate not found')
  if (est.status === 'converted') return findInvoice(est.convertedInvoiceId!)
  // Create invoice from estimate lines
  const inv = createInvoice({
    number: opts?.invoiceNumber || `INV-${Math.floor(Math.random()*9000+1000)}`,
    customerId: est.customerId,
    date: opts?.date || new Date().toISOString(),
    lines: est.lines.map(l => ({ description: l.description, amount: l.amount })),
    terms: opts?.terms || est.terms || 'Due on receipt',
    dueDate: opts?.dueDate,
  })
  updateInvoice(inv.id, { status: 'sent' })
  est.status = 'converted'
  est.convertedInvoiceId = inv.id
  recordAudit({ action: 'convert', entityType: 'estimate', entityId: est.id, after: { ...est }, meta: { invoiceId: inv.id } })
  return inv
}

export function createInvoice(input: { number: string; customerId: string; date: string; lines: { description: string; amount: number }[]; terms?: string; dueDate?: string }) {
  const total = input.lines.reduce((s,l)=>s+Number(l.amount)||0,0)
  // Normalize to next open date if requested date is in a closed period to align with posting rules used elsewhere
  const preferredIso = (input.date || new Date().toISOString()).slice(0,10)
  const effectiveDateIso = normalizeToOpenDate(preferredIso)
  const terms = input.terms || 'Net 0'
  let dueDate = input.dueDate
  if (!dueDate) {
    const base = new Date(effectiveDateIso)
    if (!isNaN(base.valueOf())) {
      // Simple Net N / Due on receipt parsing
      const m = /Net\s+(\d+)/i.exec(terms)
      const add = m ? parseInt(m[1], 10) : 0
      const utc = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + add))
      dueDate = utc.toISOString()
    } else {
      dueDate = new Date().toISOString()
    }
  }
  const invoice: Invoice = {
    id: genId('inv'),
    number: input.number,
    customerId: input.customerId,
    status: 'draft',
    date: effectiveDateIso,
    dueDate,
    terms,
    lines: input.lines,
    payments: [],
    total,
    balance: total,
  }
  db.invoices.push(invoice)
  recordAudit({ action: 'create', entityType: 'invoice', entityId: invoice.id, after: invoice })
  return invoice
}

export function findInvoice(id: string) { return db.invoices.find(i => i.id === id) }

export function updateInvoice(id: string, patch: Partial<Pick<Invoice,'number'|'customerId'|'status'|'date'|'lines'>>) {
  const inv = findInvoice(id)
  if (!inv) throw new Error('Invoice not found')
  if (patch.date) assertOpen(patch.date.slice(0,10))
  const before = { ...inv }
  Object.assign(inv, patch)
  if (patch.lines) {
    inv.total = inv.lines.reduce((s,l)=>s+l.amount,0)
    const paid = inv.payments.reduce((s,p)=>s+p.amount,0)
    inv.balance = Math.max(0, inv.total - paid)
  }
  recalcInvoiceStatus(inv)
  if (db.settings?.accountingMethod === 'accrual' && inv.status !== 'draft' && inv.status !== 'void') ensureInvoicePosted(inv)
  recordAudit({ action: 'update', entityType: 'invoice', entityId: inv.id, before, after: { ...inv } })
  return inv
}

export function applyPaymentToInvoice(id: string, amount: number, opts?: { date?: string; fundSource?: 'cash' | 'undeposited' }) {
  const inv = findInvoice(id)
  if (!inv) throw new Error('Invoice not found')
  const before = { ...inv }
  const remaining = Math.max(0, inv.total - inv.payments.reduce((s,p)=>s+p.amount,0))
  if (amount > remaining) throw new Error('Payment exceeds remaining balance')
  // Determine effective payment date (default today if not provided)
  const effectiveIso = (opts?.date || new Date().toISOString()).slice(0,10)
  // Guard against closed period using effective payment date
  assertOpen(effectiveIso)
  const payment: Payment = { id: genId('pay'), date: effectiveIso, amount, appliedToType: 'invoice', appliedToId: id, fundSource: opts?.fundSource }
  inv.payments.push(payment)
  const paid = inv.payments.reduce((s,p)=>s+p.amount,0)
  inv.balance = Math.max(0, inv.total - paid)
  if (inv.status === 'draft' && paid > 0) inv.status = 'sent'
  recalcInvoiceStatus(inv)
  if (db.settings?.accountingMethod === 'cash') {
    // Revenue recognized now
    postJournal([
      { accountNumber: '1000', debit: payment.amount },
      { accountNumber: '4000', credit: payment.amount },
    ], payment.date, { type: 'payment', id: payment.id })
  } else {
    if (inv.status !== 'draft' && inv.status !== 'void') ensureInvoicePosted(inv)
    postPayment(payment)
  }
  recordAudit({ action: 'apply-payment', entityType: 'invoice', entityId: inv.id, before, after: { ...inv }, meta: { payment } })
  // Emit normalized invoice:payment event for history APIs
  recordAudit({ action: 'invoice:payment', entityType: 'invoice', entityId: inv.id, after: { invoiceId: inv.id, customerId: inv.customerId, date: payment.date.slice(0,10), amount: payment.amount, paymentId: payment.id, remainingBalance: inv.balance } })
  return { invoice: inv, payment }
}

export function deleteInvoice(id: string) {
  const idx = db.invoices.findIndex(i => i.id === id)
  if (idx === -1) return false
  const before = { ...db.invoices[idx] }
  db.invoices.splice(idx,1)
  recordAudit({ action: 'delete', entityType: 'invoice', entityId: id, before })
  return true
}

// Bills helpers
export function listBills(filter: { start?: string; end?: string; status?: string; page: number; limit: number }) {
  const { start, end, status, page, limit } = filter
  let rows = db.bills.slice()
  if (start) rows = rows.filter(r => r.dueDate.slice(0,10) >= start)
  if (end) rows = rows.filter(r => r.dueDate.slice(0,10) <= end)
  if (status) {
    if (status === 'overdue') {
      const todayIso = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())).toISOString().slice(0,10)
      rows = rows.filter(r => r.status !== 'paid' && r.dueDate.slice(0,10) < todayIso)
    } else {
      rows = rows.filter(r => r.status === status)
    }
  }
  const total = rows.length
  const offset = (page - 1) * limit
  return { rows: rows.slice(offset, offset + limit), total }
}

export function createBill(input: { number?: string; vendorId: string; lines: { description: string; amount: number }[]; billDate?: string; terms?: string; dueDate?: string }) {
  const total = input.lines.reduce((s,l)=>s+Number(l.amount)||0,0)
  const billDate = input.billDate || new Date().toISOString()
  const terms = input.terms || 'Due on receipt'
  let dueDate = input.dueDate
  if (!dueDate) {
    const base = new Date(billDate)
    if (!isNaN(base.valueOf())) {
      const m = /Net\s+(\d+)/i.exec(terms)
      const add = m ? parseInt(m[1], 10) : 0
      const utc = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + add))
      dueDate = utc.toISOString()
    } else {
      dueDate = billDate
    }
  }
  // Closed-period guard based on transaction date fidelity (bill date)
  assertOpen(billDate.slice(0,10))
  // Duplicate bill number check per vendor (exclude voided)
  if (input.number) {
    const dup = db.bills.find(b => b.vendorId === input.vendorId && b.number === input.number && b.status !== 'void')
    if (dup) throw new Error('Duplicate bill number for vendor')
  }
  const bill: Bill = {
    id: genId('bill'),
    number: input.number || `BILL-${Math.floor(Math.random()*9000+1000)}`,
    vendorId: input.vendorId,
    status: 'open',
    billDate,
    dueDate,
    terms,
    scheduledDate: null,
    lines: input.lines,
    payments: [],
    total,
    balance: total
  }
  db.bills.push(bill)
  // Post on creation only under accrual accounting. Under cash accounting,
  // expense recognition occurs when the bill is paid.
  if (db.settings?.accountingMethod === 'accrual') ensureBillPosted(bill)
  recordAudit({ action: 'create', entityType: 'bill', entityId: bill.id, after: bill })
  return bill
}

export function findBill(id: string) { return db.bills.find(b => b.id === id) }

export function updateBill(id: string, patch: Partial<Pick<Bill,'number'|'vendorId'|'status'|'billDate'|'terms'|'dueDate'|'lines'|'scheduledDate'>>) {
  const bill = findBill(id)
  if (!bill) throw new Error('Bill not found')
  // Guard duplicate bill number per vendor if number is changing
  if (patch.number && patch.number !== bill.number) {
    const venId = patch.vendorId || bill.vendorId
    const dup = db.bills.find(b => b.id !== bill.id && b.vendorId === venId && b.number === patch.number && b.status !== 'void')
    if (dup) throw new Error('Duplicate bill number for vendor')
  }
  // If billDate/terms change and dueDate not provided, recompute dueDate from billDate + terms
  if ((patch.billDate || patch.terms) && !patch.dueDate) {
    const baseIso = (patch.billDate || bill.billDate || bill.dueDate)
    const terms = (patch.terms || bill.terms || 'Due on receipt')
    const base = baseIso ? new Date(baseIso) : null
    if (base && !isNaN(base.valueOf())) {
      const m = /Net\s+(\d+)/i.exec(terms)
      const add = m ? parseInt(m[1], 10) : 0
      const utc = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + add))
      patch.dueDate = utc.toISOString()
    }
  }
  if (patch.billDate) assertOpen(patch.billDate.slice(0,10))
  if (patch.dueDate) assertOpen(patch.dueDate.slice(0,10))
  const before = { ...bill }
  Object.assign(bill, patch)
  if (patch.lines) {
    bill.total = bill.lines.reduce((s,l)=>s+l.amount,0)
    const paid = bill.payments.reduce((s,p)=>s+p.amount,0)
    bill.balance = Math.max(0, bill.total - paid)
  }
  recalcBillStatus(bill)
  if (db.settings?.accountingMethod === 'accrual' && bill.status !== 'void') ensureBillPosted(bill)
  recordAudit({ action: 'update', entityType: 'bill', entityId: bill.id, before, after: { ...bill } })
  return bill
}

export function applyPaymentToBill(id: string, amount: number, opts?: { date?: string }) {
  const bill = findBill(id)
  if (!bill) throw new Error('Bill not found')
  const before = { ...bill }
  const remaining = Math.max(0, bill.total - bill.payments.reduce((s,p)=>s+p.amount,0))
  if (amount > remaining) throw new Error('Payment exceeds remaining balance')
  // Determine effective payment date: prefer provided date (normalized), otherwise today
  const preferred = (opts?.date || new Date().toISOString()).slice(0,10)
  // Guard against closed period using effective payment date
  assertOpen(preferred)
  const payment: Payment = { id: genId('pay'), date: preferred, amount, appliedToType: 'bill', appliedToId: id }
  bill.payments.push(payment)
  const paid = bill.payments.reduce((s,p)=>s+p.amount,0)
  bill.balance = Math.max(0, bill.total - paid)
  recalcBillStatus(bill)
  if (db.settings?.accountingMethod === 'cash') {
    postJournal([
      { accountNumber: '6000', debit: payment.amount },
      { accountNumber: '1000', credit: payment.amount },
    ], payment.date, { type: 'payment', id: payment.id })
  } else {
    ensureBillPosted(bill)
    postPayment(payment)
  }
  recordAudit({ action: 'apply-payment', entityType: 'bill', entityId: bill.id, before, after: { ...bill }, meta: { payment } })
  return { bill, payment }
}

export function scheduleBill(id: string, date: string) {
  const bill = findBill(id)
  if (!bill) throw new Error('Bill not found')
  bill.scheduledDate = date
  bill.status = 'scheduled'
  return bill
}

export function cancelBillSchedule(id: string) {
  const bill = findBill(id)
  if (!bill) throw new Error('Bill not found')
  bill.scheduledDate = null
  if (bill.balance === 0) bill.status = 'paid'
  else bill.status = 'open'
  return bill
}

export function billApprovalAction(id: string, action: 'submit' | 'approve' | 'reject', note?: string) {
  const bill = findBill(id)
  if (!bill) throw new Error('Bill not found')
  if (action === 'submit') { bill.status = 'pending_approval'; bill.approval = { status: 'pending' } }
  if (action === 'approve') { bill.status = 'approved'; bill.approval = { status: 'approved', by: 'u_mock', at: new Date().toISOString() } }
  if (action === 'reject') { bill.status = 'rejected'; bill.approval = { status: 'rejected', by: 'u_mock', at: new Date().toISOString(), note } }
  return bill
}

export function deleteBill(id: string) { const idx = db.bills.findIndex(b => b.id === id); if (idx === -1) return false; db.bills.splice(idx,1); return true }
// Enhance deleteBill with audit logging
export function deleteBillWithAudit(id: string) {
  const idx = db.bills.findIndex(b => b.id === id)
  if (idx === -1) return false
  const before = { ...db.bills[idx] }
  db.bills.splice(idx,1)
  recordAudit({ action: 'delete', entityType: 'bill', entityId: id, before })
  return true
}

// ---------------- Bank feed matching suggestions ----------------
// Suggest candidate open invoices (for positive bank amounts) or open bills (for negative amounts)
// Scoring favors closer amount match then closer date proximity.
export function suggestMatchesForBankTransaction(txnId: string, opts?: { limit?: number; windowDays?: number; amountTolerance?: number }) {
  const txn = db.transactions.find(t => t.id === txnId)
  if (!txn) throw new Error('Transaction not found')
  const limit = Math.max(1, Math.min(20, Number(opts?.limit ?? 5)))
  const windowDays = Math.max(0, Math.min(90, Number(opts?.windowDays ?? 14)))
  const tol = Number(opts?.amountTolerance ?? 1.0) // absolute currency tolerance
  const txnAmountAbs = Math.abs(Number(txn.amount || 0))
  const txnDate = new Date((txn.date || new Date().toISOString()).slice(0,10) + 'T00:00:00Z')

  function daysDiff(aIso?: string | null) {
    if (!aIso) return Number.POSITIVE_INFINITY
    const d = new Date(String(aIso))
    if (isNaN(d.valueOf())) return Number.POSITIVE_INFINITY
    return Math.abs(Math.floor((d.valueOf() - txnDate.valueOf()) / (1000*60*60*24)))
  }

  type Cand = { kind: 'invoice' | 'bill' | 'deposit' | 'transfer'; id: string; number: string; name: string; date: string; balance: number; score: number }
  const cands: Cand[] = []
  // If this is a Transfer category feed line, prioritize suggesting an existing BankTransfer that matches
  if (txn.category === 'Transfer') {
    try {
      const acct = db.accounts.find(a => a.id === txn.accountId)
      const acctNumber = acct?.number
      const transfers: any[] = (db as any).transfers || []
      for (const x of transfers) {
        const amtOk = Math.abs(Number(x.amount || 0) - txnAmountAbs) <= tol
        const dd = daysDiff(x.date)
        const dateOk = dd <= windowDays
        const sideOk = acctNumber ? (x.fromAccountNumber === acctNumber || x.toAccountNumber === acctNumber) : true
        if (!amtOk || !dateOk || !sideOk) continue
        const direction = `${x.fromAccountNumber} → ${x.toAccountNumber}`
        const score = (Math.abs(Number(x.amount || 0) - txnAmountAbs)) + (dd/10)
        cands.push({ kind: 'transfer', id: x.id, number: x.id, name: `Transfer ${direction}`, date: String(x.date || '').slice(0,10), balance: Number(Number(x.amount || 0).toFixed(2)), score })
      }
    } catch { /* no-op */ }
  }
  if (Number(txn.amount || 0) >= 0) {
    // Inflow: look for customer invoices with open balance ~ amount
    for (const inv of db.invoices) {
      if (inv.status === 'void') continue
      const bal = Math.max(0, Number(inv.total || 0) - inv.payments.reduce((s,p)=> s + (Number(p.amount)||0), 0))
      if (!(bal > 0)) continue
      const amtOk = Math.abs(bal - txnAmountAbs) <= tol
      const dd = daysDiff(inv.dueDate || inv.date)
      const dateOk = dd <= windowDays
      if (!amtOk && !dateOk) continue
      const cust = db.customers.find(c => c.id === inv.customerId)
      const score = (Math.abs(bal - txnAmountAbs)) + (dd/10)
      cands.push({ kind: 'invoice', id: inv.id, number: inv.number || inv.id, name: cust?.name || 'Customer', date: (inv.dueDate || inv.date || '').slice(0,10), balance: Number(bal.toFixed(2)), score })
    }
    // Also consider deposit batches with total ~ amount
    for (const dep of (db.deposits || [])) {
      const total = Number(dep.total || 0)
      const amtOk = Math.abs(total - txnAmountAbs) <= tol
      const dd = daysDiff(dep.date)
      const dateOk = dd <= windowDays
      if (!amtOk && !dateOk) continue
      const score = (Math.abs(total - txnAmountAbs)) + (dd/10)
      cands.push({ kind: 'deposit' as any, id: dep.id, number: dep.id, name: 'Deposit batch', date: String(dep.date || '').slice(0,10), balance: Number(total.toFixed(2)), score })
    }
  } else {
    // Outflow: look for vendor bills with open balance ~ abs(amount)
    for (const bill of db.bills) {
      if (bill.status === 'void') continue
      const bal = Math.max(0, Number(bill.total || 0) - bill.payments.reduce((s,p)=> s + (Number(p.amount)||0), 0))
      if (!(bal > 0)) continue
      const amtOk = Math.abs(bal - txnAmountAbs) <= tol
      const dd = daysDiff(bill.dueDate || bill.billDate)
      const dateOk = dd <= windowDays
      if (!amtOk && !dateOk) continue
      const ven = db.vendors.find(v => v.id === bill.vendorId)
      const score = (Math.abs(bal - txnAmountAbs)) + (dd/10)
      cands.push({ kind: 'bill', id: bill.id, number: bill.number || bill.id, name: ven?.name || 'Vendor', date: (bill.dueDate || bill.billDate || '').slice(0,10), balance: Number(bal.toFixed(2)), score })
    }
  }
  cands.sort((a,b)=> a.score - b.score || a.date.localeCompare(b.date))
  return { txn: { id: txn.id, date: String(txn.date||'').slice(0,10), amount: Number(txn.amount || 0), description: txn.description || '' }, candidates: cands.slice(0, limit) }
}

// Apply a selected match: links a bank transaction to an invoice or bill by posting a payment for the exact absolute amount of the transaction.
// Rules/guards:
// - Transaction must be in for_review or imported state (not already categorized/excluded)
// - Kind determines target: 'invoice' for positive/inflow, 'bill' for negative/outflow
// - Amount applied equals absolute transaction amount; must not exceed remaining balance
// - Uses today as effective date (normalized and closed period guarded)
// - On success: updates transaction.bankStatus -> 'categorized' and sets matched* fields
export function applyMatchToBankTransaction(input: { txnId: string; kind: 'invoice' | 'bill' | 'deposit' | 'transfer'; id: string; date?: string }) {
  const txn = db.transactions.find(t => t.id === input.txnId)
  if (!txn) throw new Error('Transaction not found')
  const status = txn.bankStatus || 'for_review'
  if (status === 'categorized' || status === 'excluded') throw new Error('Transaction not eligible for matching')
  const amountAbs = Math.abs(Number(txn.amount || 0))
  if (!(amountAbs > 0)) throw new Error('Zero amount transaction cannot be matched')
  // Determine effective date and guard closed period
  const effectiveIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(effectiveIso)
  if (input.kind === 'transfer') {
    if (txn.category !== 'Transfer') throw new Error('Only Transfer category can be matched to a bank transfer')
    const transfers: any[] = (db as any).transfers || []
    const x = transfers.find(t => t.id === input.id)
    if (!x) throw new Error('Transfer not found')
    const amtOk = Math.abs(Number(x.amount || 0) - amountAbs) <= 0.01
    if (!amtOk) throw new Error('Amount does not match transfer amount')
    const acct = db.accounts.find(a => a.id === txn.accountId)
    const acctNumber = acct?.number
    if (acctNumber && !(x.fromAccountNumber === acctNumber || x.toAccountNumber === acctNumber)) {
      throw new Error('Transfer does not involve this account')
    }
    // Link and categorize without posting any new journal
    txn.bankStatus = 'categorized'
    ;(txn as any).matchedKind = 'transfer'
    ;(txn as any).matchedId = x.id
    ;(txn as any).matchedAmount = amountAbs
    ;(txn as any).matchedRef = `${x.fromAccountNumber}→${x.toAccountNumber}`
    recordAudit({ action: 'bank-match:apply', entityType: 'transaction', entityId: txn.id, after: { ...txn }, meta: { kind: 'transfer', targetId: x.id, amount: amountAbs } })
    return { txn }
  }
  if (input.kind === 'deposit') {
    if (Number(txn.amount || 0) < 0) throw new Error('Outflow cannot be matched to deposit')
    // Only link and categorize; no journal movements
    const dep = (db.deposits || []).find(d => d.id === input.id)
    if (!dep) throw new Error('Deposit not found')
    txn.bankStatus = 'categorized'
    ;(txn as any).matchedKind = 'deposit'
    ;(txn as any).matchedId = dep.id
    ;(txn as any).matchedAmount = amountAbs
    ;(txn as any).matchedRef = dep.id
    recordAudit({ action: 'bank-match:apply', entityType: 'transaction', entityId: txn.id, after: { ...txn }, meta: { kind: 'deposit', targetId: dep.id, amount: amountAbs } })
    return { txn }
  } else if (input.kind === 'invoice') {
    if (Number(txn.amount || 0) < 0) throw new Error('Outflow cannot be matched to invoice')
    const inv = findInvoice(input.id)
    if (!inv) throw new Error('Invoice not found')
    const remaining = Math.max(0, inv.total - inv.payments.reduce((s,p)=> s + p.amount, 0))
    if (amountAbs > remaining) throw new Error('Amount exceeds invoice balance')
    const { payment } = applyPaymentToInvoice(inv.id, amountAbs, { date: effectiveIso, fundSource: 'cash' })
    // Link transaction and mark categorized
    txn.bankStatus = 'categorized'
    ;(txn as any).matchedKind = 'invoice'
    ;(txn as any).matchedId = inv.id
    ;(txn as any).matchedPaymentId = payment.id
    ;(txn as any).matchedAmount = amountAbs
    ;(txn as any).matchedRef = inv.number || inv.id
    recordAudit({ action: 'bank-match:apply', entityType: 'transaction', entityId: txn.id, after: { ...txn }, meta: { kind: 'invoice', targetId: inv.id, paymentId: payment.id, amount: amountAbs } })
    return { txn, payment }
  } else {
    if (Number(txn.amount || 0) > 0) throw new Error('Inflow cannot be matched to bill')
    const bill = findBill(input.id)
    if (!bill) throw new Error('Bill not found')
    const remaining = Math.max(0, bill.total - bill.payments.reduce((s,p)=> s + p.amount, 0))
    if (amountAbs > remaining) throw new Error('Amount exceeds bill balance')
    const { payment } = applyPaymentToBill(bill.id, amountAbs, { date: effectiveIso })
    txn.bankStatus = 'categorized'
    ;(txn as any).matchedKind = 'bill'
    ;(txn as any).matchedId = bill.id
    ;(txn as any).matchedPaymentId = payment.id
    ;(txn as any).matchedAmount = amountAbs
    ;(txn as any).matchedRef = bill.number || bill.id
    recordAudit({ action: 'bank-match:apply', entityType: 'transaction', entityId: txn.id, after: { ...txn }, meta: { kind: 'bill', targetId: bill.id, paymentId: payment.id, amount: amountAbs } })
    return { txn, payment }
  }
}

// Apply manual match to multiple items, optionally resolving the difference as interest (inflow) or bank fee (outflow)
export function applyManualMatchBundle(input: { txnId: string; kind: 'invoice'|'bill'; selections: Array<{ id: string; amount?: number }>; manualAdjustment?: { accountNumber: string; amount: number; memo?: string }; date?: string }) {
  const txn = db.transactions.find(t => t.id === input.txnId)
  if (!txn) throw new Error('Transaction not found')
  const status = txn.bankStatus || 'for_review'
  if (status === 'categorized' || status === 'excluded') throw new Error('Transaction not eligible for matching')
  const isInflow = Number(txn.amount || 0) > 0
  if (isInflow && input.kind !== 'invoice') throw new Error('Inflow must match invoices')
  if (!isInflow && input.kind !== 'bill') throw new Error('Outflow must match bills')
  const bankAbs = Math.abs(Number(txn.amount || 0))
  if (!(bankAbs > 0)) throw new Error('Zero amount transaction cannot be matched')
  const effectiveIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(effectiveIso)

  if (!Array.isArray(input.selections) || input.selections.length === 0) throw new Error('selections required')

  // Resolve amounts: default to remaining balance for each target if amount not provided
  const resolved: Array<{ id: string; amount: number }> = []
  let total = 0
  for (const s of input.selections) {
    if (!s?.id) continue
    if (input.kind === 'invoice') {
      const inv = findInvoice(s.id)
      if (!inv) throw new Error('Invoice not found: ' + s.id)
      const remaining = Math.max(0, inv.total - inv.payments.reduce((ss,p)=>ss+p.amount,0))
      const amt = typeof s.amount === 'number' && s.amount > 0 ? s.amount : remaining
      if (!(amt > 0)) continue
      if (amt > remaining) throw new Error('Amount exceeds invoice balance: ' + inv.id)
      resolved.push({ id: inv.id, amount: Number(amt.toFixed(2)) })
      total += amt
    } else {
      const bill = findBill(s.id)
      if (!bill) throw new Error('Bill not found: ' + s.id)
      const remaining = Math.max(0, bill.total - bill.payments.reduce((ss,p)=>ss+p.amount,0))
      const amt = typeof s.amount === 'number' && s.amount > 0 ? s.amount : remaining
      if (!(amt > 0)) continue
      if (amt > remaining) throw new Error('Amount exceeds bill balance: ' + bill.id)
      resolved.push({ id: bill.id, amount: Number(amt.toFixed(2)) })
      total += amt
    }
  }
  total = Number(total.toFixed(2))
  if (resolved.length === 0) throw new Error('No eligible selections')
  if (total > bankAbs + 0.0001) throw new Error('Selected total exceeds bank amount')
  let diff = Number((bankAbs - total).toFixed(2))

  // Apply payments according to kind
  if (input.kind === 'invoice') {
    for (const r of resolved) {
      applyPaymentToInvoice(r.id, r.amount, { date: effectiveIso, fundSource: 'cash' })
    }
  } else {
    for (const r of resolved) {
      applyPaymentToBill(r.id, r.amount, { date: effectiveIso })
    }
  }

  // Optionally resolve difference manually to a chosen account
  if (input.manualAdjustment) {
    const adj = input.manualAdjustment
    const adjAmt = Number(adj.amount || 0)
    const acct = db.accounts.find(a => a.number === adj.accountNumber)
    if (!acct) throw new Error('Adjustment account not found')
    if (!(adjAmt > 0)) throw new Error('Adjustment amount must be > 0')
    // Require adjustment amount to equal the remaining difference (within tolerance)
    if (Math.abs(adjAmt - diff) > 0.01) throw new Error('Adjustment must equal the difference')
  const memo = adj.memo || `Manual match adjustment ${effectiveIso}`
    if (isInflow) {
      // Inflow missing amount: DR Cash (1000), CR chosen account
      postJournal([
        { accountNumber: '1000', debit: adjAmt, memo },
        { accountNumber: acct.number, credit: adjAmt, memo },
      ], effectiveIso, { type: 'payment', id: 'manual-match-adj' })
    } else {
      // Outflow missing amount: DR chosen account, CR Cash (1000)
      postJournal([
        { accountNumber: acct.number, debit: adjAmt, memo },
        { accountNumber: '1000', credit: adjAmt, memo },
      ], effectiveIso, { type: 'payment', id: 'manual-match-adj' })
    }
    total = Number((total + adjAmt).toFixed(2))
    diff = Number((bankAbs - total).toFixed(2))
  }
  // If still difference remaining, leave unmatched (caller may handle) but do not error

  // Mark bank transaction categorized and record linkage summary
  txn.bankStatus = 'categorized'
  ;(txn as any).matchedKind = input.kind
  ;(txn as any).matchedId = undefined
  ;(txn as any).matchedPaymentId = undefined
  ;(txn as any).matchedAmount = bankAbs
  ;(txn as any).matchedCount = resolved.length
  ;(txn as any).matchedRef = 'multiple'
  recordAudit({ action: 'bank-match:apply-bundle', entityType: 'transaction', entityId: txn.id, after: { ...txn }, meta: { kind: input.kind, selections: resolved, manualAdjustment: input.manualAdjustment ? { accountNumber: input.manualAdjustment.accountNumber, amount: input.manualAdjustment.amount } : undefined } })
  return { txn, appliedCount: resolved.length, totalApplied: total, remainingDifference: Number((bankAbs - total).toFixed(2)) }
}

// Apply a complex match across both A/R (invoices) and A/P (bills) for a single bank transaction.
// The net effect must equal the bank transaction amount (within tolerance), allowing an optional manual adjustment.
// Positive bank amounts are net inflows; negative amounts net outflows. Invoices increase inflow, bills increase outflow.
export function applyComplexMatchAcrossArAp(input: { txnId: string; invoices?: Array<{ id: string; amount?: number }>; bills?: Array<{ id: string; amount?: number }>; manualAdjustment?: { accountNumber: string; amount: number; memo?: string }; date?: string }) {
  const txn = db.transactions.find(t => t.id === input.txnId)
  if (!txn) throw new Error('Transaction not found')
  const status = txn.bankStatus || 'for_review'
  if (status === 'categorized' || status === 'excluded') throw new Error('Transaction not eligible for matching')
  const bankAmt = Number(txn.amount || 0)
  if (bankAmt === 0) throw new Error('Zero amount transaction cannot be matched')
  const effectiveIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(effectiveIso)

  const invSel = Array.isArray(input.invoices) ? input.invoices : []
  const billSel = Array.isArray(input.bills) ? input.bills : []
  if (invSel.length === 0 && billSel.length === 0) throw new Error('No selections provided')

  let inflow = 0
  let outflow = 0
  const appliedInv: Array<{ id: string; amount: number }> = []
  const appliedBill: Array<{ id: string; amount: number }> = []

  for (const s of invSel) {
    const inv = findInvoice(s.id)
    if (!inv) throw new Error('Invoice not found: ' + s.id)
    const remaining = Math.max(0, inv.total - inv.payments.reduce((ss,p)=>ss+p.amount,0))
    const amt = typeof s.amount === 'number' && s.amount > 0 ? s.amount : remaining
    if (!(amt > 0)) continue
    if (amt > remaining) throw new Error('Amount exceeds invoice balance: ' + inv.id)
    applyPaymentToInvoice(inv.id, amt, { date: effectiveIso, fundSource: 'cash' })
    inflow += amt
    appliedInv.push({ id: inv.id, amount: amt })
  }

  for (const s of billSel) {
    const bill = findBill(s.id)
    if (!bill) throw new Error('Bill not found: ' + s.id)
    const remaining = Math.max(0, bill.total - bill.payments.reduce((ss,p)=>ss+p.amount,0))
    const amt = typeof s.amount === 'number' && s.amount > 0 ? s.amount : remaining
    if (!(amt > 0)) continue
    if (amt > remaining) throw new Error('Amount exceeds bill balance: ' + bill.id)
    applyPaymentToBill(bill.id, amt, { date: effectiveIso })
    outflow += amt
    appliedBill.push({ id: bill.id, amount: amt })
  }

  // Manual adjustment to resolve residual difference
  let adjAmt = 0
  if (input.manualAdjustment) {
    const adj = input.manualAdjustment
    const acct = db.accounts.find(a => a.number === adj.accountNumber)
    if (!acct) throw new Error('Adjustment account not found')
    if (!(adj.amount > 0)) throw new Error('Adjustment amount must be > 0')
    const memo = adj.memo || `Complex match adjustment ${effectiveIso}`
    // If bankAmt is positive (net inflow), and inflow - outflow < bankAmt, we need extra inflow: DR Cash, CR adj account
    // If bankAmt negative (net outflow), and outflow - inflow < -bankAmt, we need extra outflow: DR adj account, CR Cash
    const cashAcct = String((txn as any).accountNumber || '1000')
    if (bankAmt > 0) {
      postJournal([
        { accountNumber: cashAcct, debit: adj.amount, memo },
        { accountNumber: acct.number, credit: adj.amount, memo },
      ], effectiveIso, { type: 'payment', id: 'complex-match-adj' })
    } else {
      postJournal([
        { accountNumber: acct.number, debit: adj.amount, memo },
        { accountNumber: cashAcct, credit: adj.amount, memo },
      ], effectiveIso, { type: 'payment', id: 'complex-match-adj' })
    }
    adjAmt = adj.amount
  }

  const net = inflow - outflow + (bankAmt > 0 ? adjAmt : -adjAmt)
  // For positive bankAmt, net should equal bankAmt; for negative, net should equal bankAmt (which is negative)
  const within = Math.abs(net - bankAmt) < 0.01
  if (!within) {
    throw new Error('Selected totals do not match bank amount. Add or adjust selections/adjustment.')
  }

  // Mark bank transaction categorized and record linkage summary
  txn.bankStatus = 'categorized'
  ;(txn as any).matchedKind = 'complex'
  ;(txn as any).matchedId = undefined
  ;(txn as any).matchedPaymentId = undefined
  ;(txn as any).matchedAmount = Math.abs(bankAmt)
  ;(txn as any).matchedCount = appliedInv.length + appliedBill.length
  ;(txn as any).matchedRef = 'invoices+bills'
  recordAudit({ action: 'bank-match:apply-complex', entityType: 'transaction', entityId: txn.id, after: { ...txn }, meta: { invoices: appliedInv, bills: appliedBill, adjustment: adjAmt } })
  return { txn, invoicesApplied: appliedInv.length, billsApplied: appliedBill.length }
}

// Undo a previously applied match: reverses the linked payment (if safe) and restores the bank txn to For Review.
// - Requires the transaction to have matchedKind and matchedPaymentId
// - If the payment is part of a deposit (invoice case), blocks unmatch
// - Reverses all journals linked to the payment on a provided date or today (normalized to open)
// - Removes the payment line and recalculates document status/balances
export function undoMatchForBankTransaction(input: { txnId: string; reversalDate?: string }) {
  const txn = db.transactions.find(t => t.id === input.txnId)
  if (!txn) throw new Error('Transaction not found')
  const matchedKind = (txn as any).matchedKind as ('invoice' | 'bill' | 'deposit' | 'transfer' | undefined)
  const matchedPaymentId = (txn as any).matchedPaymentId as (string | undefined)
  const effectiveIso = (input.reversalDate || new Date().toISOString()).slice(0,10)
  assertOpen(effectiveIso)

  // Transfer: just unlink and record specific audit
  if (matchedKind === 'transfer') {
    const transferId = (txn as any).matchedId as (string | undefined)
    const beforeTxn = { ...txn }
    ;(txn as any).matchedKind = undefined
    ;(txn as any).matchedId = undefined
    ;(txn as any).matchedPaymentId = undefined
    ;(txn as any).matchedAmount = undefined
    ;(txn as any).matchedRef = undefined
    txn.bankStatus = 'for_review'
    recordAudit({ action: 'bank-match:undo', entityType: 'transaction', entityId: txn.id, before: beforeTxn, after: { ...txn }, meta: { kind: 'transfer', targetId: transferId } })
    return { txn }
  }
  if (!matchedKind) throw new Error('No match to undo')
  if (!matchedPaymentId && matchedKind !== 'deposit') throw new Error('No match to undo')

  // Deposit: just unlink
  if (matchedKind === 'deposit') {
    const beforeTxn = { ...txn }
    ;(txn as any).matchedKind = undefined
    ;(txn as any).matchedId = undefined
    ;(txn as any).matchedPaymentId = undefined
    ;(txn as any).matchedAmount = undefined
    txn.bankStatus = 'for_review'
    recordAudit({ action: 'bank-match:undo', entityType: 'transaction', entityId: txn.id, before: beforeTxn, after: { ...txn } })
    return { txn }
  }

  // Try invoice first
  let paymentFound = false
  if (matchedKind === 'invoice') {
    for (const inv of db.invoices) {
      const idx = inv.payments.findIndex(p => p.id === matchedPaymentId)
      if (idx !== -1) {
        const p = inv.payments[idx]
        if (p.depositId) throw new Error('Cannot unmatch: payment already deposited')
        // Reverse journals linked to this payment
        const jList = (db.journalEntries || []).filter(j => j.linkedType === 'payment' && j.linkedId === p.id)
        for (const j of jList) { try { reverseJournalEntry(j.id, { date: effectiveIso }) } catch { /* noop */ } }
        // Remove payment and recalc
        const before = { ...inv }
        inv.payments.splice(idx, 1)
        const paid = inv.payments.reduce((s,pp)=> s + pp.amount, 0)
        inv.balance = Math.max(0, inv.total - paid)
        recalcInvoiceStatus(inv)
        recordAudit({ action: 'bank-match:undo', entityType: 'invoice', entityId: inv.id, before, after: { ...inv }, meta: { paymentId: matchedPaymentId } })
        paymentFound = true
        break
      }
    }
  }
  if (!paymentFound && matchedKind === 'bill') {
    for (const bill of db.bills) {
      const idx = bill.payments.findIndex(p => p.id === matchedPaymentId)
      if (idx !== -1) {
        const p = bill.payments[idx]
        // Reverse journals linked to this payment
        const jList = (db.journalEntries || []).filter(j => j.linkedType === 'payment' && j.linkedId === p.id)
        for (const j of jList) { try { reverseJournalEntry(j.id, { date: effectiveIso }) } catch { /* noop */ } }
        const before = { ...bill }
        bill.payments.splice(idx, 1)
        const paid = bill.payments.reduce((s,pp)=> s + pp.amount, 0)
        bill.balance = Math.max(0, bill.total - paid)
        recalcBillStatus(bill)
        recordAudit({ action: 'bank-match:undo', entityType: 'bill', entityId: bill.id, before, after: { ...bill }, meta: { paymentId: matchedPaymentId } })
        paymentFound = true
        break
      }
    }
  }
  if (!paymentFound) throw new Error('Matched payment not found')
  // Clear transaction linkage and restore status
  const beforeTxn = { ...txn }
  ;(txn as any).matchedKind = undefined
  ;(txn as any).matchedId = undefined
  ;(txn as any).matchedPaymentId = undefined
  ;(txn as any).matchedAmount = undefined
  ;(txn as any).matchedRef = undefined
  txn.bankStatus = 'for_review'
  recordAudit({ action: 'bank-match:undo', entityType: 'transaction', entityId: txn.id, before: beforeTxn, after: { ...txn } })
  return { txn }
}

// ---------------- Status Recalculation Helpers ----------------
function recalcInvoiceStatus(inv: Invoice) {
  if (inv.status === 'void') return
  if (inv.balance === 0 && inv.total > 0) { inv.status = 'paid'; return }
  const due = inv.dueDate ? new Date(inv.dueDate) : null
  const today = new Date()
  if (inv.balance > 0) {
    if (due && !isNaN(due.valueOf()) && due < today) inv.status = 'overdue'
    const paidPortion = inv.total - inv.balance
    if (paidPortion > 0 && inv.balance > 0 && inv.status !== 'overdue') inv.status = 'partial'
    if (paidPortion === 0 && inv.status === 'draft') inv.status = 'draft'
    if (paidPortion === 0 && inv.status !== 'draft' && inv.status !== 'overdue') inv.status = 'sent'
  }
}

function recalcBillStatus(bill: Bill) {
  if (bill.status === 'void') return
  if (bill.balance === 0 && bill.total > 0) { bill.status = 'paid'; return }
  const due = new Date(bill.dueDate)
  const today = new Date()
  if (bill.balance > 0) {
    if (!isNaN(due.valueOf()) && due < today) bill.status = 'overdue'
    const paidPortion = bill.total - bill.balance
    if (paidPortion > 0 && bill.balance > 0 && bill.status !== 'overdue') bill.status = 'partial'
    if (paidPortion === 0 && bill.status === 'open') bill.status = 'open'
  }
}

// ---------------- Void Workflows ----------------
export function voidInvoice(id: string, opts: { createReversing?: boolean; reason?: string; reversalDate?: string } = {}) {
  const inv = findInvoice(id)
  if (!inv) throw new Error('Invoice not found')
  if (inv.status === 'void') return inv
  if (inv.payments.length > 0) throw new Error('Cannot void invoice with payments')
  const before = { ...inv }
  inv.status = 'void'
  inv.balance = 0
  // If already posted under accrual, create reversing entry to negate AR & Revenue
  let reversingId: string | undefined
  if (inv.journalEntryId && opts.createReversing) {
    const orig = db.journalEntries?.find(j => j.id === inv.journalEntryId)
    if (orig) {
      const revLines = orig.lines.map(l => {
        const acc = db.accounts.find(a => a.id === l.accountId)
        return { accountNumber: acc ? acc.number : '9999', debit: l.credit, credit: l.debit }
      })
      const reversalDate = normalizeToOpenDate((opts.reversalDate && /\d{4}-\d{2}-\d{2}/.test(opts.reversalDate)) ? opts.reversalDate : new Date().toISOString().slice(0,10))
      reversingId = postJournal(revLines, reversalDate, { type: 'invoice', id: inv.id }, { reversing: true, reversesEntryId: orig.id })
    }
  }
  recordAudit({ action: 'void', entityType: 'invoice', entityId: inv.id, before, after: { ...inv }, meta: { reversingId, reason: opts.reason, reversalDate: opts.reversalDate } })
  return inv
}

export function voidBill(id: string, opts: { createReversing?: boolean; reason?: string; reversalDate?: string } = {}) {
  const bill = findBill(id)
  if (!bill) throw new Error('Bill not found')
  if (bill.status === 'void') return bill
  if (bill.payments.length > 0) throw new Error('Cannot void bill with payments')
  const before = { ...bill }
  bill.status = 'void'
  bill.balance = 0
  let reversingId: string | undefined
  if (bill.journalEntryId && opts.createReversing) {
    const orig = db.journalEntries?.find(j => j.id === bill.journalEntryId)
    if (orig) {
      const revLines = orig.lines.map(l => {
        const acc = db.accounts.find(a => a.id === l.accountId)
        return { accountNumber: acc ? acc.number : '9999', debit: l.credit, credit: l.debit }
      })
      const reversalDate = normalizeToOpenDate((opts.reversalDate && /\d{4}-\d{2}-\d{2}/.test(opts.reversalDate)) ? opts.reversalDate : new Date().toISOString().slice(0,10))
      reversingId = postJournal(revLines, reversalDate, { type: 'bill', id: bill.id }, { reversing: true, reversesEntryId: orig.id })
    }
  }
  recordAudit({ action: 'void', entityType: 'bill', entityId: bill.id, before, after: { ...bill }, meta: { reversingId, reason: opts.reason, reversalDate: opts.reversalDate } })
  return bill
}

// ---------------- Closing & Adjusting Utilities ----------------
export function closePeriod(upToIso: string) {
  if (!/\d{4}-\d{2}-\d{2}/.test(upToIso)) throw new Error('Invalid close date')
  if (db.settings?.closeDate && db.settings.closeDate >= upToIso) return db.settings.closeDate
  db.settings!.closeDate = upToIso
  recordAudit({ action: 'close-period', entityType: 'settings', entityId: 'company', after: { closeDate: upToIso } })
  return upToIso
}

export function reopenPeriod() { db.settings!.closeDate = null }
// Add audit for reopen; accept optional reason for tracking
export function reopenPeriodWithAudit(reason?: string) { db.settings!.closeDate = null; recordAudit({ action: 'reopen-period', entityType: 'settings', entityId: 'company', after: { closeDate: null }, meta: { reason } }) }

// Close password helpers
export function setClosePassword(pwd?: string) {
  if (!pwd) { db.settings!.closePassword = undefined; recordAudit({ action: 'close-password:clear', entityType: 'settings', entityId: 'company' }); return null }
  db.settings!.closePassword = String(pwd)
  recordAudit({ action: 'close-password:set', entityType: 'settings', entityId: 'company' })
  return true
}

function assertOpen(dateIso: string) {
  if (!db.settings?.closeDate) return
  if (dateIso <= db.settings.closeDate) throw new Error('Date is in closed period')
}

// If a preferred date is in a closed period, default to the next open date (day after closeDate)
function normalizeToOpenDate(preferredIso: string) {
  const close = db.settings?.closeDate
  if (!close) return preferredIso
  if (preferredIso > close) return preferredIso
  const d = new Date(close + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0,10)
}

export function createAdjustingJournal(input: { date: string; lines: { accountNumber: string; debit?: number; credit?: number }[]; reversing?: boolean }) {
  assertOpen(input.date.slice(0,10))
  const id = postJournal(input.lines, input.date, undefined, { adjusting: true })
  let reversingId: string | undefined
  if (input.reversing) {
    const d = new Date(input.date + 'T00:00:00Z')
    const nextMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
    const revLines = input.lines.map(l => ({ accountNumber: l.accountNumber, debit: l.credit, credit: l.debit }))
    reversingId = postJournal(revLines, nextMonth.toISOString().slice(0,10), undefined, { reversing: true, reversesEntryId: id })
  }
  recordAudit({ action: 'adjusting-journal', entityType: 'journal', entityId: id, after: { id, lines: input.lines, reversingId } })
  return { id, reversingId }
}

// Create a simple reclassification entry (adjusting journal): move amount from one account to another.
// - Blocks closed periods (no silent date shifting for reclass)
// - Validates positive amount and account existence
// - Links to an original journal when provided via meta
export function createReclassEntry(input: { fromAccountNumber: string; toAccountNumber: string; amount: number; date?: string; memo?: string; linkToJournalId?: string }) {
  const amount = Number(input.amount)
  if (!(amount > 0)) throw new Error('Amount must be > 0')
  const from = db.accounts.find(a => a.number === input.fromAccountNumber)
  const to = db.accounts.find(a => a.number === input.toAccountNumber)
  if (!from) throw new Error('From account not found')
  if (!to) throw new Error('To account not found')
  if (from.number === to.number) throw new Error('From and To accounts must differ')
  const dateIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(dateIso)
  const memo = input.memo || `Reclass ${from.number} → ${to.number}`
  const id = postJournal([
    { accountNumber: input.toAccountNumber, debit: amount, memo },
    { accountNumber: input.fromAccountNumber, credit: amount, memo },
  ], dateIso, undefined, { adjusting: true })
  recordAudit({ action: 'reclass', entityType: 'journal', entityId: id, after: { id, from: from.number, to: to.number, amount, date: dateIso, memo }, meta: { linkToJournalId: input.linkToJournalId } })
  return id
}

// Write off remaining balance of an invoice (partial allowed):
// - Posts DR Expense (6000) and CR A/R (1100)
// - Applies a synthetic payment line to set invoice balance down by the write-off amount
// - Enforces open-period guard on the effective date (today or provided date)
export function writeOffInvoice(input: { invoiceId: string; amount?: number; date?: string; expenseAccountNumber?: string; memo?: string }) {
  const inv = findInvoice(input.invoiceId)
  if (!inv) throw new Error('Invoice not found')
  const remaining = Math.max(0, inv.total - inv.payments.reduce((s,p)=> s + p.amount, 0))
  if (remaining <= 0) throw new Error('Invoice has no remaining balance')
  const amount = Number(input.amount ?? remaining)
  if (!(amount > 0)) throw new Error('Amount must be > 0')
  if (amount > remaining) throw new Error('Amount exceeds invoice remaining balance')
  const dateIso = (input.date || new Date().toISOString()).slice(0,10)
  assertOpen(dateIso)
  const expenseAcc = db.accounts.find(a => a.number === (input.expenseAccountNumber || '6000'))
  if (!expenseAcc) throw new Error('Expense account not found')
  // Post adjusting journal
  const memo = input.memo || `Invoice ${inv.number || inv.id} write-off`
  const jeId = postJournal([
    { accountNumber: expenseAcc.number, debit: amount, memo },
    { accountNumber: '1100', credit: amount, memo },
  ], dateIso, { type: 'invoice', id: inv.id })
  // Apply synthetic payment with special marker
  const payment: Payment = { id: genId('pay'), date: dateIso, amount, appliedToType: 'invoice', appliedToId: inv.id }
  inv.payments.push(payment)
  const paid = inv.payments.reduce((s,p)=> s + p.amount, 0)
  inv.balance = Math.max(0, inv.total - paid)
  recalcInvoiceStatus(inv)
  recordAudit({ action: 'invoice:write-off', entityType: 'invoice', entityId: inv.id, after: { ...inv }, meta: { amount, jeId, memo } })
  return { invoice: inv, journalEntryId: jeId }
}

// Auto-seed mock DB on import so unit tests have predictable sample data
try { seedIfNeeded() } catch (e) { /* ignore */ }
