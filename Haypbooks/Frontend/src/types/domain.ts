// Domain model interfaces for mock backend & future real API alignment
export interface Account {
  id: string
  number: string
  name: string
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'
  parentId?: string
  balance: number
  // Accounts are active by default; inactive accounts are hidden from pickers unless explicitly included
  active?: boolean
  // Whether this account is eligible for bank-style reconciliation (i.e., has a real-world statement)
  // Typically true for bank accounts, credit cards, and certain loans; false for Undeposited Funds, AR/AP control, income/expense.
  reconcilable?: boolean
  // Optional finer-grained classification (mock-friendly)
  detailType?: string
}

export interface Customer { id: string; name: string; terms?: string; email?: string; phone?: string; creditLimit?: number }
export interface Vendor { id: string; name: string; terms?: string; email?: string; phone?: string }
export interface Item { id: string; name: string; type: 'service' | 'product'; defaultAccountId?: string; unitPrice?: number }

// Lightweight tagging/dimensions for demo (can represent class/location/project)
export interface Tag {
  id: string
  name: string
  group?: string // optional grouping, e.g., 'Department', 'Channel'
}

export interface Transaction {
  id: string
  date: string // ISO yyyy-mm-dd or full ISO
  description: string
  category: 'Income' | 'Expense' | 'Transfer'
  amount: number // positive for Income, negative for Expense typically; Transfer flexible
  accountId: string
  // Optional splits for categorization: when present, sum of amounts should equal Transaction.amount
  splits?: Array<{
    accountId: string
    amount: number
    memo?: string
    tags?: string[]
  }>
  // Bank feed style workflow status: imported (raw), for_review (needs categorization), categorized (finalized), excluded (ignored)
  bankStatus?: 'imported' | 'for_review' | 'categorized' | 'excluded'
  // Source of transaction: imported from bank feed vs manually created
  source?: 'import' | 'manual'
  // External identifier from bank/aggregator to deduplicate pulls
  externalId?: string
  // Optional dimension tags
  tags?: string[]
  // Bank clearing status (for reconciliation UI/demo). Typically true once matched to a statement line.
  cleared?: boolean
  // Reconciliation status flags
  reconciled?: boolean
  reconciledAt?: string // ISO timestamp when reconciled
  // Optional linkage when matched to a document via bank feed apply-match
  matchedKind?: 'invoice' | 'bill' | 'deposit'
  matchedId?: string
  matchedPaymentId?: string
  matchedAmount?: number
  matchedRef?: string
}

// Simple bank rule model to mimic common auto-categorization patterns
export interface BankRule {
  id: string
  name: string
  // Match conditions (all optional; any provided must match)
  textIncludes?: string // case-insensitive substring match on description
  amountEquals?: number
  // Actions
  setCategory?: Transaction['category']
  setStatus?: 'categorized' | 'excluded'
}

export interface Payment {
  id: string
  date: string
  amount: number
  appliedToType: 'invoice' | 'bill'
  appliedToId: string
  // Optional cash receipt workflow metadata
  fundSource?: 'cash' | 'undeposited' // 'undeposited' means initially posted to Undeposited Funds until grouped into a bank deposit
  depositId?: string // set when included in a deposit batch
}

// Customer-level payment that may allocate across multiple invoices (mock extension)
export interface CustomerPaymentAllocation { invoiceId: string; amount: number }
export interface CustomerPayment {
  id: string
  customerId: string
  date: string
  method?: string
  reference?: string
  amountReceived: number
  allocations: CustomerPaymentAllocation[]
  amountAllocated: number
  amountUnapplied: number
  status: 'unapplied' | 'partial' | 'fully_applied'
  paymentIds: string[] // underlying per-invoice Payment ids generated
  createdAt: string
}

// Bank deposit grouping multiple undeposited payments
export interface DepositBatch {
  id: string
  date: string
  paymentIds: string[]
  total: number
  journalEntryId?: string
  // Optional memo/description for the deposit batch
  memo?: string
  // Void tracking fields
  voidedAt?: string
  reversingEntryId?: string
  createdAt: string
}

// Customer refund (refund receipt) – issues cash/check against a customer's credit balance
export interface CustomerRefund {
  id: string
  customerId: string
  date: string
  amount: number
  method?: string
  reference?: string
  // Optional linkage when refunding a specific credit memo
  creditMemoId?: string
  journalEntryId?: string
}

// Vendor refund (cash received from a vendor against an A/P credit)
export interface VendorRefund {
  id: string
  vendorId: string
  date: string
  amount: number
  method?: string
  reference?: string
  // Optional linkage when receiving cash against a specific vendor credit memo
  vendorCreditId?: string
  journalEntryId?: string
}

export interface JournalEntryLine { accountId: string; debit: number; credit: number; memo?: string }
export interface JournalEntry {
  id: string
  date: string
  lines: JournalEntryLine[]
  source?: string
  linkedType?: 'invoice' | 'bill' | 'payment'
  linkedId?: string
  adjusting?: boolean
  reversing?: boolean
  reversesEntryId?: string
}

// Bank Transfer between two Asset accounts
export interface BankTransfer {
  id: string
  date: string // yyyy-mm-dd
  fromAccountNumber: string
  toAccountNumber: string
  amount: number
  memo?: string
  journalEntryId?: string
}

// ---------------- App Transactions (Connectors, Syncs, Postings) ----------------
export type AppConnectorKind = 'banking' | 'time' | 'commerce' | 'other'
export type AppConnectorStatus = 'connected' | 'needs_auth' | 'error' | 'disabled'

export interface AppConnector {
  id: string
  name: string
  kind: AppConnectorKind
  status: AppConnectorStatus
  lastSyncAt?: string | null
  lastSyncStatus?: 'success' | 'error' | 'partial' | null
  createdAt: string
  settings?: Record<string, any>
}

export interface AppSyncRun {
  id: string
  connectorId: string
  startedAt: string
  finishedAt?: string
  status: 'running' | 'success' | 'error'
  newPostings: number
  errors?: string[]
}

export type AppPostingType = 'sale' | 'payout' | 'fee' | 'time' | 'expense' | 'transfer'
export type AppPostingStatus = 'pending' | 'posted' | 'ignored' | 'error'

export interface AppPosting {
  id: string
  connectorId: string
  externalId?: string
  date: string // yyyy-mm-dd
  description?: string
  type: AppPostingType
  amount: number
  status: AppPostingStatus
  // Optional linkage to internal docs/txns (mock only)
  linkedTransactionId?: string
  linkedInvoiceId?: string
  linkedBillId?: string
  // When posted, capture the created journal entry id (mock ledger)
  journalEntryId?: string
  // Timestamps for audit-friendly UI (optional)
  postedAt?: string
  ignoredAt?: string
  createdAt: string
  errorMessage?: string
}

// Basic audit event model (skeleton) for security/compliance trail
export interface AuditEvent {
  id: string
  ts: string // ISO timestamp
  actor?: string // placeholder until auth implemented
  action: string // e.g. 'create','update','delete','close-period','adjusting-journal'
  entityType?: string // e.g. 'invoice','bill','transaction','settings','journal'
  entityId?: string
  before?: any
  after?: any
  meta?: Record<string, any>
}

export interface ReconcileSession {
  id: string
  accountId: string
  periodEnd: string // yyyy-mm-dd
  beginningBalance?: number
  endingBalance: number
  serviceCharge?: number
  interestEarned?: number
  note?: string
  clearedIds: string[]
  createdAt: string // ISO timestamp
  // Snapshot of reconciled transaction states at finalize time for discrepancy detection
  snapshot?: Array<{ id: string; date: string; amount: number }>
}

export interface InvoiceLine { description: string; amount: number; itemId?: string }
export interface Invoice {
  id: string
  number: string
  customerId: string
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'void'
  date: string
  dueDate?: string
  terms?: string // e.g. 'Net 30'
  lines: InvoiceLine[]
  payments: Payment[]
  total: number
  balance: number
  journalEntryId?: string
  // Optional dimension tags
  tags?: string[]
  // Collections reminder tracking
  lastReminderDate?: string
  reminderCount?: number
  // Derived/maintained collections dunning stage label (Stage1..Stage4) for quick UI filtering (optional; may be recomputed)
  dunningStage?: 'Stage1' | 'Stage2' | 'Stage3' | 'Stage4'
}

// Sales Estimate (quote) – draft/sent/accepted/converted/declined; convertible to invoice
export interface EstimateLine { description: string; amount: number; itemId?: string }
export interface Estimate {
  id: string
  number: string
  customerId: string
  status: 'draft' | 'sent' | 'accepted' | 'converted' | 'declined'
  date: string
  expiryDate?: string
  terms?: string
  lines: EstimateLine[]
  total: number
  convertedInvoiceId?: string
  // Optional dimension tags
  tags?: string[]
}
// Vendor credit (A/P credit memo)
export interface VendorCreditLine { description: string; amount: number; itemId?: string }
export interface VendorCredit {
  id: string
  number: string
  vendorId: string
  date: string
  lines: VendorCreditLine[]
  total: number
  remaining: number
  applied: { billId: string; amount: number }[]
  journalEntryId?: string
}

// Projects & Time Tracking
export interface Project {
  id: string
  name: string
  customerId: string
  hourlyRate?: number // default rate for billable time entries
  active: boolean
  createdAt: string
  // Optional dimension tags
  tags?: string[]
}

export interface TimeEntry {
  id: string
  customerId: string
  projectId?: string
  date: string // yyyy-mm-dd
  hours: number
  description?: string
  billable: boolean
  rate?: number // if omitted, derives from project.hourlyRate or a default
  amount: number // computed: hours * rate when billable, else 0
  status: 'unbilled' | 'billed' | 'nonbillable'
  billedInvoiceId?: string // set when converted to invoice
  createdAt: string
  // Optional dimension tags
  tags?: string[]
}

// Promise-to-Pay commitment (customer acknowledges future payment date)
export interface PromiseToPay {
  id: string
  customerId: string
  invoiceIds: string[] // invoices covered by the promise (may be subset)
  amount: number
  promisedDate: string // yyyy-mm-dd
  status: 'open' | 'kept' | 'broken'
  createdAt: string
  keptAt?: string
  brokenAt?: string
  note?: string
}

export interface BillLine { description: string; amount: number; itemId?: string }
export interface Bill {
  id: string
  number: string
  vendorId: string
  // Extended statuses include approval workflow; 'pending_approval' & 'approved'/'rejected'
  status: 'open' | 'scheduled' | 'paid' | 'pending_approval' | 'approved' | 'rejected' | 'partial' | 'overdue' | 'void'
  // Bill date (invoice date from vendor). Optional for backward compatibility; if missing, dueDate may be used elsewhere.
  billDate?: string
  dueDate: string
  // Payment terms label, e.g. 'Net 30' or 'Due on receipt'
  terms?: string
  scheduledDate?: string | null
  lines: BillLine[]
  payments: Payment[]
  total: number
  balance: number
  // Optional approval metadata when bill enters workflow
  approval?: BillApproval
  journalEntryId?: string
  // Optional dimension tags
  tags?: string[]
}

// Purchase Order (non-posting until receipt/bill)
export interface PurchaseOrderLine { description: string; itemId?: string; qty: number; rate: number }
export interface PurchaseOrder {
  id: string
  number: string
  vendorId: string
  status: 'open' | 'closed'
  date: string
  lines: PurchaseOrderLine[]
  total: number // qty * rate summed
}

export interface CompanySettings {
  accountingMethod: 'accrual' | 'cash'
  baseCurrency?: string
  closeDate?: string | null
  allowBackdated?: boolean
  closePassword?: string
}

export interface BillApproval {
  status: 'pending' | 'approved' | 'rejected'
  by?: string
  at?: string // ISO timestamp
  note?: string
}

export interface DatabaseState {
  accounts: Account[]
  transactions: Transaction[]
  invoices: Invoice[]
  estimates?: Estimate[]
  bills: Bill[]
  customers: Customer[]
  vendors: Vendor[]
  items: Item[]
  journalEntries?: JournalEntry[]
  auditEvents: AuditEvent[]
  seeded: boolean
  settings?: CompanySettings
  // Tag catalog for dimension filters
  tags?: Tag[]
  // Payments configuration (mock)
  paymentsEnabled?: boolean
  paymentMethods?: string[]
  // Bank feed rules
  bankRules?: BankRule[]
  // Reconciliation sessions
  reconcileSessions?: ReconcileSession[]
  // AR payments & deposits (mock extension)
  customerPayments?: CustomerPayment[]
  deposits?: DepositBatch[]
  // Customer refunds (refund receipts)
  customerRefunds?: CustomerRefund[]
  // Vendor refunds (cash received from vendors)
  vendorRefunds?: VendorRefund[]
  // Collections promises (promise-to-pay commitments)
  promises: PromiseToPay[]
  // Projects & Time Tracking
  projects?: Project[]
  timeEntries?: TimeEntry[]
  // AP vendor credits (credit memos)
  vendorCredits?: VendorCredit[]
  // Purchase Orders
  purchaseOrders?: PurchaseOrder[]
  // Bank transfers
  transfers?: BankTransfer[]
  // App Transactions
  appConnectors?: AppConnector[]
  appSyncRuns?: AppSyncRun[]
  appPostings?: AppPosting[]
  // Users (for authentication)
  users?: Array<{
    id: string
    email: string
    name: string
    password: string // In production: hashed with bcrypt/argon2
    role: 'owner' | 'admin' | 'manager' | 'accountant' | 'ar-clerk' | 'ap-clerk' | 'viewer'
    createdAt: string
  }>
  // Messages (for statements, reminders, etc.)
  messages?: any[]
}
