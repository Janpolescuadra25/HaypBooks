// mockGLState.ts — Mock GL State for Bank Feed interactive testing
// Simulates real backend DB behavior (JE creation/removal) client-side

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MockCOAAccount {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
}

export interface MockEntity {
  id: string;
  name: string;
  type: 'Customer' | 'Vendor' | 'Employee';
}

export interface MockJournalEntryLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface MockJournalEntry {
  id: string;
  date: string;
  description: string;
  type: 'Bill' | 'Invoice' | 'BankCategorize' | 'BankSplit' | 'BankMatch' | 'BankTransfer';
  status: 'POSTED' | 'DRAFT';
  referenceNo?: string;
  contactName?: string;
  totalAmount: number;
  lines: MockJournalEntryLine[];
}

export interface MockSplitLine {
  accountId: string;
  accountName: string;
  amount: number;
  memo?: string;
}

export type MockTxStatus = 'PENDING' | 'CATEGORIZED' | 'MATCHED' | 'EXCLUDED';
export type MockTxType = 'Bank Transaction' | 'Bank Payment' | 'Bank Receipt' | 'Split Transaction' | 'Bank Transfer';

export interface MockBankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;               // negative = debit/expense, positive = credit/income
  accountId: string;            // bank account the tx belongs to
  status: MockTxStatus;
  transactionType?: MockTxType;
  journalEntryId?: string;      // set when CATEGORIZED / MATCHED / SPLIT
  accountCode?: string;
  accountName?: string;         // GL account categorized to
  contactId?: string;
  contactName?: string;
  memo?: string;
  ruleName?: string;            // set when auto-categorised by rule
  splitLines?: MockSplitLine[]; // set when SPLIT
  ref?: string;
  bankRef?: string;
  isTransferMirror?: boolean;   // true for auto-created mirror transfers
  transferSourceId?: string;    // id of the original transfer transaction
}

export interface MockRule {
  id: string;
  name: string;
  matchKeyword: string;         // checked against tx.description (case-insensitive)
  accountId: string;
  accountName: string;
  contactId?: string;
  contactName?: string;
  memo?: string;
  transactionType: MockTxType;
}

// ─── COA Accounts (21) ──────────────────────────────────────────────────────

export const MOCK_COA_ACCOUNTS: MockCOAAccount[] = [
  { id: 'acc-1001', code: '1001', name: 'Cash on Hand',           type: 'Asset'     },
  { id: 'acc-1100', code: '1100', name: 'BDO Checking Account',   type: 'Asset'     },
  { id: 'acc-1101', code: '1101', name: 'BPI Savings Account',    type: 'Asset'     },
  { id: 'acc-1200', code: '1200', name: 'Accounts Receivable',    type: 'Asset'     },
  { id: 'acc-1300', code: '1300', name: 'Inventory',              type: 'Asset'     },
  { id: 'acc-1400', code: '1400', name: 'Prepaid Expenses',       type: 'Asset'     },
  { id: 'acc-1500', code: '1500', name: 'Equipment',              type: 'Asset'     },
  { id: 'acc-2001', code: '2001', name: 'Accounts Payable',       type: 'Liability' },
  { id: 'acc-2002', code: '2002', name: 'Accrued Liabilities',    type: 'Liability' },
  { id: 'acc-3001', code: '3001', name: "Owner's Equity",         type: 'Equity'    },
  { id: 'acc-4001', code: '4001', name: 'Service Revenue',        type: 'Revenue'   },
  { id: 'acc-4002', code: '4002', name: 'Product Sales',          type: 'Revenue'   },
  { id: 'acc-4003', code: '4003', name: 'Other Income',           type: 'Revenue'   },
  { id: 'acc-5001', code: '5001', name: 'Cost of Goods Sold',     type: 'Expense'   },
  { id: 'acc-5100', code: '5100', name: 'Utilities Expense',      type: 'Expense'   },
  { id: 'acc-5101', code: '5101', name: 'Telecommunications',     type: 'Expense'   },
  { id: 'acc-5102', code: '5102', name: 'Rent Expense',           type: 'Expense'   },
  { id: 'acc-5103', code: '5103', name: 'Meals & Entertainment',  type: 'Expense'   },
  { id: 'acc-5104', code: '5104', name: 'Transportation',         type: 'Expense'   },
  { id: 'acc-5200', code: '5200', name: 'Government Contributions', type: 'Expense' },
  { id: 'acc-5202', code: '5202', name: 'Software Subscriptions', type: 'Expense'   },
];

// ─── Entities (8) ───────────────────────────────────────────────────────────

export const MOCK_ENTITIES: MockEntity[] = [
  { id: 'ent-c001', name: 'Ayala Land Inc.',        type: 'Customer' },
  { id: 'ent-c002', name: 'SM Prime Holdings',       type: 'Customer' },
  { id: 'ent-c003', name: 'Jollibee Foods Corp.',    type: 'Customer' },
  { id: 'ent-v001', name: 'MERALCO',                 type: 'Vendor'   },
  { id: 'ent-v002', name: 'PLDT Enterprise',         type: 'Vendor'   },
  { id: 'ent-v003', name: 'Globe Telecom',            type: 'Vendor'   },
  { id: 'ent-v004', name: 'Grab Philippines',        type: 'Vendor'   },
  { id: 'ent-e001', name: 'Juan dela Cruz',          type: 'Employee' },
];

// ─── Pre-existing JEs for Find Match (4) ────────────────────────────────────

export const MOCK_EXISTING_JES: MockJournalEntry[] = [
  {
    id: 'je-bill-001',
    date: '2026-03-10',
    description: 'Bill: MERALCO Electric Bill Feb-Mar 2026',
    type: 'Bill',
    status: 'POSTED',
    referenceNo: 'BILL-2026-031',
    contactName: 'MERALCO',
    totalAmount: 15420.00,
    lines: [
      { accountId: 'acc-5100', accountName: 'Utilities Expense', debit: 15420.00, credit: 0 },
      { accountId: 'acc-2001', accountName: 'Accounts Payable',  debit: 0, credit: 15420.00 },
    ],
  },
  {
    id: 'je-bill-002',
    date: '2026-03-15',
    description: 'Bill: PLDT Monthly Internet & Fiber Mar 2026',
    type: 'Bill',
    status: 'POSTED',
    referenceNo: 'BILL-2026-032',
    contactName: 'PLDT Enterprise',
    totalAmount: 4800.00,
    lines: [
      { accountId: 'acc-5101', accountName: 'Telecommunications', debit: 4800.00, credit: 0 },
      { accountId: 'acc-2001', accountName: 'Accounts Payable',   debit: 0, credit: 4800.00 },
    ],
  },
  {
    id: 'je-inv-001',
    date: '2026-03-20',
    description: 'Invoice: Ayala Land – March Consulting Services',
    type: 'Invoice',
    status: 'POSTED',
    referenceNo: 'INV-2026-012',
    contactName: 'Ayala Land Inc.',
    totalAmount: 85000.00,
    lines: [
      { accountId: 'acc-1200', accountName: 'Accounts Receivable', debit: 85000.00, credit: 0 },
      { accountId: 'acc-4001', accountName: 'Service Revenue',      debit: 0, credit: 85000.00 },
    ],
  },
  {
    id: 'je-inv-002',
    date: '2026-04-01',
    description: 'Invoice: SM Prime – Q1 Support Retainer',
    type: 'Invoice',
    status: 'POSTED',
    referenceNo: 'INV-2026-015',
    contactName: 'SM Prime Holdings',
    totalAmount: 45000.00,
    lines: [
      { accountId: 'acc-1200', accountName: 'Accounts Receivable', debit: 45000.00, credit: 0 },
      { accountId: 'acc-4001', accountName: 'Service Revenue',      debit: 0, credit: 45000.00 },
    ],
  },
  // Additional Bills & Invoices for match page search results
  {
    id: 'je-bill-003',
    date: '2026-03-23',
    description: 'Bill: Grab Philippines — Delivery Services Mar 2026',
    type: 'Bill',
    status: 'POSTED',
    referenceNo: 'BILL-2026-033',
    contactName: 'Grab Philippines',
    totalAmount: 2350.00,
    lines: [
      { accountId: 'acc-5104', accountName: 'Transportation',    debit: 2350.00, credit: 0 },
      { accountId: 'acc-2001', accountName: 'Accounts Payable',  debit: 0, credit: 2350.00 },
    ],
  },
  {
    id: 'je-inv-003',
    date: '2026-03-28',
    description: 'Invoice: Ayala Land — April Consulting Retainer',
    type: 'Invoice',
    status: 'POSTED',
    referenceNo: 'INV-2026-016',
    contactName: 'Ayala Land Inc.',
    totalAmount: 75000.00,
    lines: [
      { accountId: 'acc-1200', accountName: 'Accounts Receivable', debit: 75000.00, credit: 0 },
      { accountId: 'acc-4001', accountName: 'Service Revenue',      debit: 0, credit: 75000.00 },
    ],
  },
  {
    id: 'je-bill-004',
    date: '2026-03-18',
    description: 'Bill: Shopee Inc — Online Marketplace Fees Mar 2026',
    type: 'Bill',
    status: 'POSTED',
    referenceNo: 'BILL-2026-034',
    contactName: 'Shopee Inc.',
    totalAmount: 4500.00,
    lines: [
      { accountId: 'acc-5001', accountName: 'Cost of Goods Sold', debit: 4500.00, credit: 0 },
      { accountId: 'acc-2001', accountName: 'Accounts Payable',    debit: 0, credit: 4500.00 },
    ],
  },
  {
    id: 'je-bill-005',
    date: '2026-03-26',
    description: 'Bill: Converge ICT — Fiber Internet Mar 2026',
    type: 'Bill',
    status: 'POSTED',
    referenceNo: 'BILL-2026-035',
    contactName: 'Converge ICT',
    totalAmount: 1899.00,
    lines: [
      { accountId: 'acc-5101', accountName: 'Telecommunications', debit: 1899.00, credit: 0 },
      { accountId: 'acc-2001', accountName: 'Accounts Payable',    debit: 0, credit: 1899.00 },
    ],
  },
  {
    id: 'je-inv-004',
    date: '2026-04-06',
    description: 'Invoice: Jollibee Foods — Q1 Franchise Remittance',
    type: 'Invoice',
    status: 'POSTED',
    referenceNo: 'INV-2026-017',
    contactName: 'Jollibee Foods Corp.',
    totalAmount: 120000.00,
    lines: [
      { accountId: 'acc-1200', accountName: 'Accounts Receivable', debit: 120000.00, credit: 0 },
      { accountId: 'acc-4002', accountName: 'Product Sales',        debit: 0, credit: 120000.00 },
    ],
  },
];

// ─── Auto-Categorize Rules (8) ───────────────────────────────────────────────

export let MOCK_RULES: MockRule[] = [
  {
    id: 'rule-001', name: 'MERALCO Utility Bills',
    matchKeyword: 'MERALCO',
    accountId: 'acc-5100', accountName: 'Utilities Expense',
    contactId: 'ent-v001', contactName: 'MERALCO',
    transactionType: 'Bank Payment',
  },
  {
    id: 'rule-002', name: 'PLDT Telecom',
    matchKeyword: 'PLDT',
    accountId: 'acc-5101', accountName: 'Telecommunications',
    contactId: 'ent-v002', contactName: 'PLDT Enterprise',
    transactionType: 'Bank Payment',
  },
  {
    id: 'rule-003', name: 'Globe Telecom',
    matchKeyword: 'GLOBE',
    accountId: 'acc-5101', accountName: 'Telecommunications',
    contactId: 'ent-v003', contactName: 'Globe Telecom',
    transactionType: 'Bank Payment',
  },
  {
    id: 'rule-004', name: 'Grab Transport',
    matchKeyword: 'GRAB',
    accountId: 'acc-5104', accountName: 'Transportation',
    contactId: 'ent-v004', contactName: 'Grab Philippines',
    transactionType: 'Bank Payment',
  },
  {
    id: 'rule-005', name: '7-Eleven Meals',
    matchKeyword: '7-ELEVEN',
    accountId: 'acc-5103', accountName: 'Meals & Entertainment',
    transactionType: 'Bank Payment',
  },
  {
    id: 'rule-006', name: 'SSS Government Contributions',
    matchKeyword: 'SSS',
    accountId: 'acc-5200', accountName: 'Government Contributions',
    transactionType: 'Bank Payment',
  },
  {
    id: 'rule-007', name: 'Google Workspace',
    matchKeyword: 'GOOGLE',
    accountId: 'acc-5202', accountName: 'Software Subscriptions',
    transactionType: 'Bank Payment',
  },
  {
    id: 'rule-008', name: 'Microsoft 365',
    matchKeyword: 'MICROSOFT',
    accountId: 'acc-5202', accountName: 'Software Subscriptions',
    transactionType: 'Bank Payment',
  },
];

// ─── Mock Transactions (30) ───────────────────────────────────────────────────
// Spread March–April 2026, realistic Philippine business context
// 10 PENDING, 12 CATEGORIZED, 3 MATCHED, 5 EXCLUDED

export const MOCK_TRANSACTIONS: MockBankTransaction[] = [
  // ── PENDING (10) ──
  {
    id: 'mt-001', date: '2026-04-15', accountId: 'acct-bdo',
    description: 'MERALCO PAYMENT REF# 2026-04-001',
    amount: -18_650.00, status: 'PENDING',
  },
  {
    id: 'mt-002', date: '2026-04-14', accountId: 'acct-bdo',
    description: 'PLDT ENTERPRISE MONTHLY FEE APR2026',
    amount: -4_800.00, status: 'PENDING',
  },
  {
    id: 'mt-003', date: '2026-04-13', accountId: 'acct-bdo',
    description: 'GRAB PAY TXN#4892 TRANSPORT',
    amount: -2_350.00, status: 'PENDING',
  },
  {
    id: 'mt-004', date: '2026-04-12', accountId: 'acct-bdo',
    description: 'SM PRIME HOLDINGS PAYMENT INV-2026-015',
    amount: 45_000.00, status: 'PENDING',
  },
  {
    id: 'mt-005', date: '2026-04-11', accountId: 'acct-bdo',
    description: '7-ELEVEN CONVENIENCE STORE MAKATI',
    amount: -1_240.00, status: 'PENDING',
  },
  {
    id: 'mt-006', date: '2026-04-10', accountId: 'acct-bdo',
    description: 'SSS EMPLOYER CONTRIBUTION MAR2026',
    amount: -8_480.00, status: 'PENDING',
  },
  {
    id: 'mt-007', date: '2026-04-09', accountId: 'acct-bdo',
    description: 'GOOGLE WORKSPACE ANNUAL BIZ PLAN',
    amount: -13_728.00, status: 'PENDING',
  },
  {
    id: 'mt-008', date: '2026-04-08', accountId: 'acct-bdo',
    description: 'GLOBE BUSINESS PLAN APRIL 2026',
    amount: -3_500.00, status: 'PENDING',
  },
  {
    id: 'mt-009', date: '2026-04-07', accountId: 'acct-bdo',
    description: 'AYALA LAND CONSULTING RETAINER APR',
    amount: 75_000.00, status: 'PENDING',
  },
  {
    id: 'mt-010', date: '2026-04-06', accountId: 'acct-bdo',
    description: 'OFFICE DEPOT CUBAO SUPPLIES',
    amount: -6_800.00, status: 'PENDING',
  },

  // ── CATEGORIZED (12) ──
  {
    id: 'mt-011', date: '2026-04-05', accountId: 'acct-bdo',
    description: 'JOLLIBEE FRANCHISEE COLLECTION MAR',
    amount: 120_000.00, status: 'CATEGORIZED',
    transactionType: 'Bank Receipt',
    journalEntryId: 'je-gen-011',
    accountCode: '4002', accountName: 'Product Sales',
    contactId: 'ent-c003', contactName: 'Jollibee Foods Corp.',
    memo: 'March franchise collection payment',
  },
  {
    id: 'mt-012', date: '2026-04-04', accountId: 'acct-bdo',
    description: 'MICROSOFT 365 BUSINESS PREMIUM',
    amount: -8_736.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-012',
    accountCode: '5202', accountName: 'Software Subscriptions',
    ruleName: 'Microsoft 365',
  },
  {
    id: 'mt-013', date: '2026-04-03', accountId: 'acct-bdo',
    description: 'BDO ANNUAL FEE DEBIT CARD',
    amount: -750.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-013',
    accountCode: '2002', accountName: 'Accrued Liabilities',
    memo: 'Annual debit card maintenance fee',
  },
  {
    id: 'mt-014', date: '2026-04-02', accountId: 'acct-bdo',
    description: 'GRAB PAY - DELIVERY REIMBURSEMENT',
    amount: -1_890.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-014',
    accountCode: '5104', accountName: 'Transportation',
    contactId: 'ent-v004', contactName: 'Grab Philippines',
    ruleName: 'Grab Transport',
  },
  {
    id: 'mt-015', date: '2026-04-01', accountId: 'acct-bdo',
    description: 'SM PRIME Q1 RETAINER ADVANCE',
    amount: 30_000.00, status: 'CATEGORIZED',
    transactionType: 'Bank Receipt',
    journalEntryId: 'je-gen-015',
    accountCode: '4001', accountName: 'Service Revenue',
    contactId: 'ent-c002', contactName: 'SM Prime Holdings',
    memo: 'Q1 2026 retainer advance',
  },
  {
    id: 'mt-016', date: '2026-03-31', accountId: 'acct-bdo',
    description: 'SSS CONTRIBUTION REMITTANCE FEB',
    amount: -8_480.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-016',
    accountCode: '5200', accountName: 'Government Contributions',
    ruleName: 'SSS Government Contributions',
  },
  {
    id: 'mt-017', date: '2026-03-29', accountId: 'acct-bdo',
    description: 'AYALA LAND CONSULTING RETAINER MAR',
    amount: 85_000.00, status: 'CATEGORIZED',
    transactionType: 'Bank Receipt',
    journalEntryId: 'je-gen-017',
    accountCode: '4001', accountName: 'Service Revenue',
    contactId: 'ent-c001', contactName: 'Ayala Land Inc.',
    memo: 'March consulting services',
  },
  {
    id: 'mt-018', date: '2026-03-27', accountId: 'acct-bdo',
    description: 'MERALCO PAYMENT FEB BILLING',
    amount: -14_200.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-018',
    accountCode: '5100', accountName: 'Utilities Expense',
    contactId: 'ent-v001', contactName: 'MERALCO',
    ruleName: 'MERALCO Utility Bills',
  },
  {
    id: 'mt-019', date: '2026-03-25', accountId: 'acct-bdo',
    description: 'OFFICE RENT BGC MARCH 2026',
    amount: -55_000.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-019',
    accountCode: '5102', accountName: 'Rent Expense',
    memo: 'BGC office space March rent',
  },
  {
    id: 'mt-020', date: '2026-03-22', accountId: 'acct-bdo',
    description: 'PLDT FIBER INTERNET FEB2026',
    amount: -4_800.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-020',
    accountCode: '5101', accountName: 'Telecommunications',
    contactId: 'ent-v002', contactName: 'PLDT Enterprise',
    ruleName: 'PLDT Telecom',
  },
  {
    id: 'mt-021', date: '2026-03-18', accountId: 'acct-bdo',
    description: 'GLOBE BUSINESS MARCH PLAN',
    amount: -3_500.00, status: 'CATEGORIZED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-gen-021',
    accountCode: '5101', accountName: 'Telecommunications',
    contactId: 'ent-v003', contactName: 'Globe Telecom',
    ruleName: 'Globe Telecom',
  },
  {
    id: 'mt-022', date: '2026-03-15', accountId: 'acct-bdo',
    description: 'JOLLIBEE FEB COLLECTION PARTIAL',
    amount: 60_000.00, status: 'CATEGORIZED',
    transactionType: 'Bank Receipt',
    journalEntryId: 'je-gen-022',
    accountCode: '4002', accountName: 'Product Sales',
    contactId: 'ent-c003', contactName: 'Jollibee Foods Corp.',
    memo: 'February partial collection',
  },

  // ── MATCHED (3) ──
  {
    id: 'mt-023', date: '2026-03-12', accountId: 'acct-bdo',
    description: 'BDO ONLINE TRF - MERALCO PAYMENT',
    amount: -15_420.00, status: 'MATCHED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-bill-001',
    accountCode: '5100', accountName: 'Utilities Expense',
    contactId: 'ent-v001', contactName: 'MERALCO',
  },
  {
    id: 'mt-024', date: '2026-03-16', accountId: 'acct-bdo',
    description: 'BDO ONLINE TRF - PLDT BROADBAND',
    amount: -4_800.00, status: 'MATCHED',
    transactionType: 'Bank Payment',
    journalEntryId: 'je-bill-002',
    accountCode: '5101', accountName: 'Telecommunications',
    contactId: 'ent-v002', contactName: 'PLDT Enterprise',
  },
  {
    id: 'mt-025', date: '2026-03-21', accountId: 'acct-bdo',
    description: 'INCOMING WIRE - AYALA LAND CONSULTING MARCH',
    amount: 85_000.00, status: 'MATCHED',
    transactionType: 'Bank Receipt',
    journalEntryId: 'je-inv-001',
    accountCode: '4001', accountName: 'Service Revenue',
    contactId: 'ent-c001', contactName: 'Ayala Land Inc.',
  },

  // ── EXCLUDED (5) ──
  {
    id: 'mt-026', date: '2026-03-08', accountId: 'acct-bdo',
    description: 'BDO BANK CHARGE - INTERBANK TRF FEE',
    amount: -150.00, status: 'EXCLUDED',
  },
  {
    id: 'mt-027', date: '2026-03-06', accountId: 'acct-bdo',
    description: 'DUPLICATE TXN REF#20260306001',
    amount: -4_800.00, status: 'EXCLUDED',
  },
  {
    id: 'mt-028', date: '2026-03-04', accountId: 'acct-bdo',
    description: 'REVERSAL CREDIT ADJ AML REVIEW',
    amount: 4_800.00, status: 'EXCLUDED',
  },
  {
    id: 'mt-029', date: '2026-03-02', accountId: 'acct-bdo',
    description: 'BDO SERVICE FEE MONTHLY',
    amount: -300.00, status: 'EXCLUDED',
  },
  {
    id: 'mt-030', date: '2026-03-01', accountId: 'acct-bdo',
    description: 'INTERNAL TRANSFER - TEST TXN',
    amount: -1.00, status: 'EXCLUDED',
  },
];

// ─── Mutable Runtime State ────────────────────────────────────────────────────
// mockJEs starts as a copy and accumulates newly created JEs during the session

let _jeCounter = 100;
export let mockJEs: MockJournalEntry[] = [...MOCK_EXISTING_JES];

function nextJEId(): string {
  return `je-mock-${++_jeCounter}`;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Categorize a PENDING transaction. Creates a new mock JE and returns the updated tx.
 */
export function categorizeTransaction(
  tx: MockBankTransaction,
  accountId: string,
  accountName: string,
  contactId?: string,
  contactName?: string,
  memo?: string,
  ruleName?: string,
): MockBankTransaction {
  const jeId = nextJEId();
  const isDebit = tx.amount < 0;
  const abs = Math.abs(tx.amount);
  const bankAccId = 'acc-1100'; // BDO Checking
  const bankAccName = 'BDO Checking Account';

  const je: MockJournalEntry = {
    id: jeId,
    date: tx.date,
    description: tx.description,
    type: 'BankCategorize',
    status: 'POSTED',
    contactName: contactName,
    totalAmount: abs,
    lines: isDebit
      ? [
          { accountId, accountName, debit: abs, credit: 0, memo },
          { accountId: bankAccId, accountName: bankAccName, debit: 0, credit: abs },
        ]
      : [
          { accountId: bankAccId, accountName: bankAccName, debit: abs, credit: 0 },
          { accountId, accountName, debit: 0, credit: abs, memo },
        ],
  };

  mockJEs = [...mockJEs, je];

  return {
    ...tx,
    status: 'CATEGORIZED',
    transactionType: isDebit ? 'Bank Payment' : 'Bank Receipt',
    journalEntryId: jeId,
    accountCode: MOCK_COA_ACCOUNTS.find(a => a.id === accountId)?.code,
    accountName,
    contactId,
    contactName,
    memo,
    ruleName,
    splitLines: undefined,
  };
}

/**
 * Match a PENDING/CATEGORIZED transaction to an existing JE (Bill/Invoice).
 */
export function matchTransaction(
  tx: MockBankTransaction,
  existingJEId: string,
  matchType: 'Bank Payment' | 'Bank Receipt',
): MockBankTransaction {
  const je = mockJEs.find(j => j.id === existingJEId);
  const expenseLine = je?.lines.find(l => l.debit > 0);
  return {
    ...tx,
    status: 'MATCHED',
    transactionType: matchType,
    journalEntryId: existingJEId,
    accountCode: MOCK_COA_ACCOUNTS.find(a => a.id === expenseLine?.accountId)?.code,
    accountName: expenseLine?.accountName,
    contactName: je?.contactName,
    splitLines: undefined,
  };
}

/**
 * Split a PENDING transaction across multiple GL accounts.
 * Creates a mock JE with N debit lines + 1 bank credit line.
 */
export function splitTransaction(
  tx: MockBankTransaction,
  splits: Array<{ accountId: string; accountName: string; amount: number; memo?: string }>,
): MockBankTransaction {
  const jeId = nextJEId();
  const abs = Math.abs(tx.amount);
  const bankAccId = 'acc-1100';
  const bankAccName = 'BDO Checking Account';
  const isDebit = tx.amount < 0;

  const lines: MockJournalEntryLine[] = [
    ...splits.map(s => ({
      accountId: s.accountId,
      accountName: s.accountName,
      debit: isDebit ? s.amount : 0,
      credit: isDebit ? 0 : s.amount,
      memo: s.memo,
    })),
    {
      accountId: bankAccId,
      accountName: bankAccName,
      debit: isDebit ? 0 : abs,
      credit: isDebit ? abs : 0,
    },
  ];

  const je: MockJournalEntry = {
    id: jeId,
    date: tx.date,
    description: tx.description,
    type: 'BankSplit',
    status: 'POSTED',
    totalAmount: abs,
    lines,
  };

  mockJEs = [...mockJEs, je];

  const sl: MockSplitLine[] = splits.map(s => ({
    accountId: s.accountId,
    accountName: s.accountName,
    amount: s.amount,
    memo: s.memo,
  }));

  return {
    ...tx,
    status: 'CATEGORIZED',
    transactionType: 'Split Transaction',
    journalEntryId: jeId,
    accountCode: undefined,
    accountName: `Split (${splits.length} lines)`,
    splitLines: sl,
    ruleName: undefined,
  };
}

/**
 * Exclude a PENDING transaction.
 */
export function excludeTransaction(tx: MockBankTransaction): MockBankTransaction {
  return {
    ...tx,
    status: 'EXCLUDED',
    transactionType: undefined,
    journalEntryId: undefined,
    accountCode: undefined,
    accountName: undefined,
    contactId: undefined,
    contactName: undefined,
    memo: undefined,
    splitLines: undefined,
    ruleName: undefined,
  };
}

/**
 * Undo: revert a CATEGORIZED / MATCHED / EXCLUDED transaction back to PENDING.
 * Removes the associated mock JE if it was generated (not a pre-existing Bill/Invoice match).
 */
export function undoCategorize(tx: MockBankTransaction): MockBankTransaction {
  if (tx.journalEntryId) {
    const je = mockJEs.find(j => j.id === tx.journalEntryId);
    // Only remove JEs we generated (BankCategorize / BankSplit / BankMatch),
    // not pre-existing Bills/Invoices
    if (je && (je.type === 'BankCategorize' || je.type === 'BankSplit' || je.type === 'BankMatch')) {
      mockJEs = mockJEs.filter(j => j.id !== tx.journalEntryId);
    }
  }

  return {
    ...tx,
    status: 'PENDING',
    transactionType: undefined,
    journalEntryId: undefined,
    accountCode: undefined,
    accountName: undefined,
    contactId: undefined,
    contactName: undefined,
    memo: undefined,
    splitLines: undefined,
    ruleName: undefined,
  };
}

/**
 * Apply rules to all PENDING transactions.
 * Returns an array of updated transactions (only those that matched a rule).
 */
export function applyRules(transactions: MockBankTransaction[]): MockBankTransaction[] {
  const updated: MockBankTransaction[] = [];

  for (const tx of transactions) {
    if (tx.status !== 'PENDING') continue;

    const rule = MOCK_RULES.find(r =>
      tx.description.toUpperCase().includes(r.matchKeyword.toUpperCase()),
    );
    if (!rule) continue;

    const newTx = categorizeTransaction(
      tx,
      rule.accountId,
      rule.accountName,
      rule.contactId,
      rule.contactName,
      rule.memo,
      rule.name,
    );
    updated.push({ ...newTx, id: tx.id });
  }

  return updated;
}

// ─── Shared Mutable Store ─────────────────────────────────────────────────────
// Shared client-side state so match/page and split/page can access & mutate items

export const mockStore = {
  items: [...MOCK_TRANSACTIONS] as MockBankTransaction[],
}

// ─── Auto-Match Detection ─────────────────────────────────────────────────────

export interface MatchSuggestion {
  je: MockJournalEntry;
  diff: number;     // absolute ₱ difference
  isExact: boolean; // true when diff < 0.01
}

/**
 * Scan PENDING transactions against all Bills/Invoices in mockJEs.
 * Returns a map of { transactionId → MatchSuggestion[] }.
 * Only includes transactions that have at least one candidate (diff ≤ ₱5.00).
 */
export function detectAutoMatches(
  transactions: MockBankTransaction[] = mockStore.items,
): Record<string, MatchSuggestion[]> {
  const result: Record<string, MatchSuggestion[]> = {}
  const allJEs = mockJEs.filter(j => j.type === 'Bill' || j.type === 'Invoice')

  for (const tx of transactions) {
    if (tx.status !== 'PENDING') continue
    const isExpense = tx.amount < 0
    const absAmt   = Math.abs(tx.amount)
    const candidates = allJEs.filter(j => isExpense ? j.type === 'Bill' : j.type === 'Invoice')
    const matches = candidates
      .map(je => ({ je, diff: Math.abs(je.totalAmount - absAmt) }))
      .filter(m => m.diff <= 5.00)
      .map(m  => ({ ...m, isExact: m.diff < 0.01 }))
      .sort((a, b) => a.diff - b.diff)

    if (matches.length > 0) result[tx.id] = matches
  }

  return result
}

// ─── Categorization History ───────────────────────────────────────────────────

export interface CategorizationHistory {
  description: string     // keyword to match against tx.description (uppercase)
  accountId: string
  accountName: string
  accountCode: string
  contactId: string | null
  contactName: string | null
  count: number
}

export let CATEGORIZATION_HISTORY: CategorizationHistory[] = [
  { description: 'MERALCO',   accountId: 'acc-5100', accountName: 'Utilities Expense',        accountCode: '5100', contactId: 'ent-v001', contactName: 'MERALCO',           count: 3 },
  { description: 'PLDT',      accountId: 'acc-5101', accountName: 'Telecommunications',        accountCode: '5101', contactId: 'ent-v002', contactName: 'PLDT Enterprise',    count: 2 },
  { description: 'GLOBE',     accountId: 'acc-5101', accountName: 'Telecommunications',        accountCode: '5101', contactId: 'ent-v003', contactName: 'Globe Telecom',      count: 2 },
  { description: 'GRAB',      accountId: 'acc-5104', accountName: 'Transportation',            accountCode: '5104', contactId: 'ent-v004', contactName: 'Grab Philippines',   count: 2 },
  { description: '7-ELEVEN',  accountId: 'acc-5103', accountName: 'Meals & Entertainment',     accountCode: '5103', contactId: null,       contactName: null,                count: 1 },
  { description: 'SSS',       accountId: 'acc-5200', accountName: 'Government Contributions',  accountCode: '5200', contactId: null,       contactName: null,                count: 2 },
  { description: 'GOOGLE',    accountId: 'acc-5202', accountName: 'Software Subscriptions',    accountCode: '5202', contactId: null,       contactName: null,                count: 2 },
  { description: 'MICROSOFT', accountId: 'acc-5202', accountName: 'Software Subscriptions',    accountCode: '5202', contactId: null,       contactName: null,                count: 2 },
]

export function findHistoryMatch(description: string): CategorizationHistory | null {
  const upper = description.toUpperCase()
  return CATEGORIZATION_HISTORY.find(h => upper.includes(h.description)) ?? null
}

export function addToHistory(
  description: string,
  accountId: string,
  accountName: string,
  accountCode: string,
  contactId: string | null,
  contactName: string | null,
): void {
  const upper = description.toUpperCase()
  // Extract a keyword: first word of description (at least 4 chars)
  const keyword = upper.split(/\s+/).find(w => w.length >= 4) ?? upper.slice(0, 8)
  const existing = CATEGORIZATION_HISTORY.find(
    h => h.description === keyword && h.accountId === accountId
  )
  if (existing) {
    existing.count++
  } else {
    CATEGORIZATION_HISTORY.push({ description: keyword, accountId, accountName, accountCode, contactId, contactName, count: 1 })
  }
}

// ─── Mock Bank Accounts ───────────────────────────────────────────────────────

export const MOCK_BANK_ACCOUNTS = [
  { id: 'acct-bdo',       name: 'BDO Checking',         accountNumber: '\u2022\u2022\u2022\u2022 4521', balance: 150_000 },
  { id: 'acct-bpi',       name: 'BPI Savings',           accountNumber: '\u2022\u2022\u2022\u2022 7823', balance:  45_000 },
  { id: 'acct-metrobank', name: 'Metrobank Business',    accountNumber: '\u2022\u2022\u2022\u2022 3102', balance: 280_000 },
]

// ─── Transfer Transaction ─────────────────────────────────────────────────────

/**
 * Mark a PENDING bank transaction as a Bank Transfer.
 * Creates:
 *  - A journal entry (DR one bank / CR other bank)
 *  - A mirror transaction in the other bank's feed
 *  - Updates tx.status to CATEGORIZED / Bank Transfer
 */
export function transferTransaction(
  txId: string,
  otherAccountId: string,
  direction: 'to' | 'from',
  date?: string,
  memo?: string,
): { tx: MockBankTransaction; mirrorTx: MockBankTransaction; je: MockJournalEntry } | null {
  const tx = mockStore.items.find(t => t.id === txId);
  if (!tx || tx.status !== 'PENDING') return null;

  const otherAccount = MOCK_BANK_ACCOUNTS.find(a => a.id === otherAccountId);
  if (!otherAccount) return null;

  const currentBank = MOCK_BANK_ACCOUNTS.find(a => a.id === tx.accountId);
  const transferAmount = Math.abs(tx.amount);
  const effectiveDate = date || tx.date;
  const effectiveMemo = memo || (
    direction === 'to'
      ? `Transfer to ${otherAccount.name}`
      : `Transfer from ${otherAccount.name}`
  );

  // Update the transaction in place
  tx.status = 'CATEGORIZED';
  tx.transactionType = 'Bank Transfer';
  tx.accountName = 'Bank Transfers';
  tx.memo = effectiveMemo;

  // Create Journal Entry
  const jeId = `JE-TRANSFER-${Date.now()}`;
  const je: MockJournalEntry = {
    id: jeId,
    date: effectiveDate,
    description: effectiveMemo,
    type: 'BankTransfer',
    status: 'POSTED',
    totalAmount: transferAmount,
    lines: direction === 'to'
      ? [
          { accountId: otherAccountId, accountName: otherAccount.name, debit: transferAmount, credit: 0 },
          { accountId: tx.accountId,   accountName: currentBank?.name ?? 'Bank', debit: 0, credit: transferAmount },
        ]
      : [
          { accountId: tx.accountId,   accountName: currentBank?.name ?? 'Bank', debit: transferAmount, credit: 0 },
          { accountId: otherAccountId, accountName: otherAccount.name, debit: 0, credit: transferAmount },
        ],
  };

  tx.journalEntryId = jeId;
  mockJEs = [...mockJEs, je];

  // Create mirror transaction in the other bank's feed
  const mirrorTx: MockBankTransaction = {
    id: `TX-MIRROR-${Date.now()}`,
    date: effectiveDate,
    description: direction === 'to'
      ? `Transfer from ${currentBank?.name ?? 'Bank'}`
      : `Transfer to ${currentBank?.name ?? 'Bank'}`,
    amount: direction === 'to' ? transferAmount : -transferAmount,
    accountId: otherAccountId,
    status: 'CATEGORIZED',
    transactionType: 'Bank Transfer',
    accountName: 'Bank Transfers',
    memo: effectiveMemo,
    isTransferMirror: true,
    transferSourceId: txId,
  };

  mockStore.items.push(mirrorTx);

  // Add to categorization history
  addToHistory(tx.description, 'transfer-clearing', 'Bank Transfers', 'XFER', null, null);

  return { tx, mirrorTx, je };
}

// ─── Search for Match ─────────────────────────────────────────────────────────

/**
 * Full-text search across all mockJEs for manual matching.
 * Returns MatchSuggestion[] sorted by relevance (exact amount first).
 */
export function searchForMatch(
  query: string,
  filters?: {
    type?: 'Bill' | 'Invoice' | 'JE';
    amountMin?: number;
    amountMax?: number;
    dateFrom?: string;
    dateTo?: string;
  },
): MatchSuggestion[] {
  return mockJEs
    .filter(je => {
      if (filters?.type) {
        if (filters.type === 'Bill'    && je.type !== 'Bill')    return false;
        if (filters.type === 'Invoice' && je.type !== 'Invoice') return false;
        if (filters.type === 'JE'      && (je.type === 'Bill' || je.type === 'Invoice')) return false;
      }
      if (filters?.amountMin !== undefined && je.totalAmount < filters.amountMin) return false;
      if (filters?.amountMax !== undefined && je.totalAmount > filters.amountMax) return false;
      if (filters?.dateFrom && je.date < filters.dateFrom) return false;
      if (filters?.dateTo   && je.date > filters.dateTo)   return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          je.description.toLowerCase().includes(q) ||
          (je.contactName ?? '').toLowerCase().includes(q) ||
          (je.referenceNo ?? '').toLowerCase().includes(q) ||
          je.id.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .map(je => ({ je, diff: 0, isExact: false }));
}

// ─── Batch Match Transactions ─────────────────────────────────────────────────

/**
 * Match multiple PENDING bank transactions to a single Bill/Invoice JE.
 * All selected transactions are linked to the same targetJeId.
 */
export function batchMatchTransactions(
  txIds: string[],
  targetJeId: string,
): MockJournalEntry | null {
  const txs = txIds
    .map(id => mockStore.items.find(t => t.id === id))
    .filter((t): t is MockBankTransaction => Boolean(t));
  if (txs.length === 0) return null;
  const targetJe = mockJEs.find(je => je.id === targetJeId);
  if (!targetJe) return null;

  txs.forEach(tx => {
    tx.status          = 'MATCHED';
    tx.transactionType = tx.amount < 0 ? 'Bank Payment' : 'Bank Receipt';
    tx.journalEntryId  = targetJeId;
    tx.accountName     = targetJe.lines.find(l => l.debit > 0)?.accountName ?? tx.accountName;
    tx.contactName     = targetJe.contactName ?? tx.contactName;
  });

  return targetJe;
}

// ─── Match With Difference ────────────────────────────────────────────────────

/**
 * Match a PENDING transaction to a JE where amounts don't exactly match.
 * Resolution types:
 *  - write_off: create an adjustment JE for the difference amount
 *  - adjust:    match at the bank tx amount (no extra JE)
 *  - split_remaining: match + leave difference as a new PENDING transaction
 */
export function matchWithDifference(
  txId: string,
  targetJeId: string,
  resolution: {
    type: 'write_off' | 'adjust' | 'split_remaining';
    writeOffAccountId?: string;
    adjustedAmount?: number;
  },
): MockJournalEntry | null {
  const tx = mockStore.items.find(t => t.id === txId);
  if (!tx) return null;
  const targetJe = mockJEs.find(je => je.id === targetJeId);
  if (!targetJe) return null;

  const matchType: 'Bank Payment' | 'Bank Receipt' = tx.amount < 0 ? 'Bank Payment' : 'Bank Receipt';

  if (resolution.type === 'write_off' && resolution.writeOffAccountId) {
    const diff      = Math.abs(tx.amount) - targetJe.totalAmount;
    const writeAcct = MOCK_COA_ACCOUNTS.find(a => a.id === resolution.writeOffAccountId);
    if (Math.abs(diff) > 0.01 && writeAcct) {
      const adjJeId = nextJEId();
      const adjJe: MockJournalEntry = {
        id: adjJeId,
        date: tx.date,
        description: `Difference write-off: ${tx.description}`,
        type: 'BankMatch',
        status: 'POSTED',
        totalAmount: Math.abs(diff),
        lines: diff > 0
          ? [
              { accountId: resolution.writeOffAccountId, accountName: writeAcct.name, debit: Math.abs(diff), credit: 0 },
              { accountId: tx.accountId, accountName: 'Bank', debit: 0, credit: Math.abs(diff) },
            ]
          : [
              { accountId: tx.accountId, accountName: 'Bank', debit: Math.abs(diff), credit: 0 },
              { accountId: resolution.writeOffAccountId, accountName: writeAcct.name, debit: 0, credit: Math.abs(diff) },
            ],
      };
      mockJEs = [...mockJEs, adjJe];
    }
  }

  // Update the transaction
  const updated = matchTransaction(tx, targetJeId, matchType);
  const idx = mockStore.items.findIndex(t => t.id === txId);
  if (idx >= 0) mockStore.items[idx] = updated;

  return targetJe;
}
