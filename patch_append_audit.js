const fs = require('fs');
const f = 'Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/mockGLState.ts';
let c = fs.readFileSync(f, 'utf8');

const appendix = `
// ─── Audit Log System ─────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action:
    | 'categorized' | 'matched' | 'unmatched' | 'split' | 'unsplitted'
    | 'transferred' | 'untransferred' | 'excluded' | 'unexcluded'
    | 'rule_applied' | 'rule_created' | 'rule_updated' | 'rule_deleted'
    | 'manual_entry';
  userId: string;
  userName: string;
  entityType: 'transaction' | 'rule' | 'register_entry';
  entityId: string;
  entityDescription: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export const auditLog: AuditLogEntry[] = [];

export function addAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId' | 'userName'>,
): void {
  auditLog.unshift({
    ...entry,
    id: \`AUDIT-\${Date.now()}-\${Math.random().toString(36).slice(2, 6)}\`,
    timestamp: new Date().toISOString(),
    userId: 'current-user',
    userName: 'Juan Dela Cruz',
  });
}

export function getAuditLogForEntity(entityId: string): AuditLogEntry[] {
  return auditLog.filter(e => e.entityId === entityId);
}

// ─── Pre-seeded Audit Log (20 entries) ────────────────────────────────────────
// Simulates activity over the past few days

;(() => {
  const seed: Array<Omit<AuditLogEntry, 'id' | 'userId' | 'userName'>> = [
    { timestamp: '2026-04-10T08:15:00.000Z', action: 'categorized', entityType: 'transaction', entityId: 'mt-011', entityDescription: 'JOLLIBEE FRANCHISEE COLLECTION MAR', details: 'Categorized as Product Sales · Jollibee Foods Corp.', oldValue: 'PENDING', newValue: 'Product Sales' },
    { timestamp: '2026-04-10T08:20:00.000Z', action: 'categorized', entityType: 'transaction', entityId: 'mt-012', entityDescription: 'MICROSOFT 365 BUSINESS PREMIUM', details: 'Rule "Microsoft 365" applied → Software Subscriptions', oldValue: 'PENDING', newValue: 'Software Subscriptions' },
    { timestamp: '2026-04-10T08:25:00.000Z', action: 'rule_applied', entityType: 'rule', entityId: 'mt-014', entityDescription: 'GRAB PAY - DELIVERY REIMBURSEMENT', details: 'Rule "Grab Transport" applied → Transportation', newValue: 'Transportation' },
    { timestamp: '2026-04-10T09:00:00.000Z', action: 'categorized', entityType: 'transaction', entityId: 'mt-013', entityDescription: 'BDO ANNUAL FEE DEBIT CARD', details: 'Categorized as Accrued Liabilities', oldValue: 'PENDING', newValue: 'Accrued Liabilities' },
    { timestamp: '2026-04-10T09:30:00.000Z', action: 'categorized', entityType: 'transaction', entityId: 'mt-015', entityDescription: 'SM PRIME Q1 RETAINER ADVANCE', details: 'Categorized as Service Revenue · SM Prime Holdings', oldValue: 'PENDING', newValue: 'Service Revenue' },
    { timestamp: '2026-04-09T13:00:00.000Z', action: 'rule_applied', entityType: 'rule', entityId: 'mt-016', entityDescription: 'SSS CONTRIBUTION REMITTANCE FEB', details: 'Rule "SSS Government Contributions" applied → Government Contributions', newValue: 'Government Contributions' },
    { timestamp: '2026-04-09T13:05:00.000Z', action: 'categorized', entityType: 'transaction', entityId: 'mt-017', entityDescription: 'AYALA LAND CONSULTING RETAINER MAR', details: 'Categorized as Service Revenue · Ayala Land Inc.', oldValue: 'PENDING', newValue: 'Service Revenue' },
    { timestamp: '2026-04-09T14:00:00.000Z', action: 'rule_applied', entityType: 'rule', entityId: 'mt-018', entityDescription: 'MERALCO PAYMENT FEB BILLING', details: 'Rule "MERALCO Utility Bills" applied → Utilities Expense', newValue: 'Utilities Expense' },
    { timestamp: '2026-04-08T10:00:00.000Z', action: 'categorized', entityType: 'transaction', entityId: 'mt-019', entityDescription: 'OFFICE RENT BGC MARCH 2026', details: 'Categorized as Rent Expense', oldValue: 'PENDING', newValue: 'Rent Expense' },
    { timestamp: '2026-04-08T10:30:00.000Z', action: 'rule_applied', entityType: 'rule', entityId: 'mt-020', entityDescription: 'PLDT FIBER INTERNET FEB2026', details: 'Rule "PLDT Telecom" applied → Telecommunications', newValue: 'Telecommunications' },
    { timestamp: '2026-04-08T11:00:00.000Z', action: 'rule_applied', entityType: 'rule', entityId: 'mt-021', entityDescription: 'GLOBE BUSINESS MARCH PLAN', details: 'Rule "Globe Telecom" applied → Telecommunications', newValue: 'Telecommunications' },
    { timestamp: '2026-04-07T09:00:00.000Z', action: 'categorized', entityType: 'transaction', entityId: 'mt-022', entityDescription: 'JOLLIBEE FEB COLLECTION PARTIAL', details: 'Categorized as Product Sales · Jollibee Foods Corp.', oldValue: 'PENDING', newValue: 'Product Sales' },
    { timestamp: '2026-04-07T09:30:00.000Z', action: 'matched', entityType: 'transaction', entityId: 'mt-023', entityDescription: 'BDO ONLINE TRF - MERALCO PAYMENT', details: 'Matched to Bill BILL-2026-031 · MERALCO', oldValue: 'PENDING', newValue: 'je-bill-001' },
    { timestamp: '2026-04-07T09:35:00.000Z', action: 'matched', entityType: 'transaction', entityId: 'mt-024', entityDescription: 'BDO ONLINE TRF - PLDT BROADBAND', details: 'Matched to Bill BILL-2026-032 · PLDT Enterprise', oldValue: 'PENDING', newValue: 'je-bill-002' },
    { timestamp: '2026-04-07T10:00:00.000Z', action: 'matched', entityType: 'transaction', entityId: 'mt-025', entityDescription: 'INCOMING WIRE - AYALA LAND CONSULTING MARCH', details: 'Matched to Invoice INV-2026-012 · Ayala Land Inc.', oldValue: 'PENDING', newValue: 'je-inv-001' },
    { timestamp: '2026-04-06T14:00:00.000Z', action: 'excluded', entityType: 'transaction', entityId: 'mt-026', entityDescription: 'BDO BANK CHARGE - INTERBANK TRF FEE', details: 'Excluded from books', oldValue: 'PENDING', newValue: 'EXCLUDED' },
    { timestamp: '2026-04-06T14:05:00.000Z', action: 'excluded', entityType: 'transaction', entityId: 'mt-027', entityDescription: 'DUPLICATE TXN REF#20260306001', details: 'Excluded: duplicate transaction', oldValue: 'PENDING', newValue: 'EXCLUDED' },
    { timestamp: '2026-04-06T14:10:00.000Z', action: 'excluded', entityType: 'transaction', entityId: 'mt-028', entityDescription: 'REVERSAL CREDIT ADJ AML REVIEW', details: 'Excluded: AML review reversal', oldValue: 'PENDING', newValue: 'EXCLUDED' },
    { timestamp: '2026-04-05T11:00:00.000Z', action: 'rule_created', entityType: 'rule', entityId: 'rule-007', entityDescription: 'Google Workspace', details: 'Rule created: If description contains GOOGLE → Software Subscriptions' },
    { timestamp: '2026-04-05T11:30:00.000Z', action: 'rule_created', entityType: 'rule', entityId: 'rule-008', entityDescription: 'Microsoft 365', details: 'Rule created: If description contains MICROSOFT → Software Subscriptions' },
  ];
  seed.reverse().forEach(entry => {
    auditLog.push({
      ...entry,
      id: \`AUDIT-SEED-\${Math.random().toString(36).slice(2, 9)}\`,
      userId: 'current-user',
      userName: 'Juan Dela Cruz',
    });
  });
})();

// ─── Balance Summary ──────────────────────────────────────────────────────────

export function getBalances(bankAccountId?: string): {
  bankBalance: number;
  booksBalance: number;
  difference: number;
} {
  const txs = bankAccountId
    ? mockStore.items.filter(t => t.accountId === bankAccountId)
    : mockStore.items;
  const bankBalance = txs.reduce((sum, t) => sum + t.amount, 0);
  const booksBalance = txs
    .filter(t => ['CATEGORIZED', 'MATCHED'].includes(t.status) && !t.isTransferMirror)
    .reduce((sum, t) => sum + t.amount, 0);
  return {
    bankBalance: Math.round(bankBalance * 100) / 100,
    booksBalance: Math.round(booksBalance * 100) / 100,
    difference: Math.round((bankBalance - booksBalance) * 100) / 100,
  };
}

// ─── Register Entries ─────────────────────────────────────────────────────────

export interface RegisterEntry extends MockBankTransaction {
  runningBalance: number;
}

export function getRegisterEntries(
  bankAccountId: string,
  dateFrom?: string,
  dateTo?: string,
): RegisterEntry[] {
  let entries = mockStore.items.filter(
    t => t.accountId === bankAccountId && ['CATEGORIZED', 'MATCHED'].includes(t.status),
  );
  if (dateFrom) entries = entries.filter(t => t.date >= dateFrom);
  if (dateTo)   entries = entries.filter(t => t.date <= dateTo);
  entries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const bankAccount = MOCK_BANK_ACCOUNTS.find(a => a.id === bankAccountId);
  let runningBalance = bankAccount?.openingBalance ?? 0;

  return entries.map(tx => {
    runningBalance += tx.amount;
    return { ...tx, runningBalance: Math.round(runningBalance * 100) / 100 };
  });
}
`;

c = c.trimEnd() + '\n' + appendix;
fs.writeFileSync(f, c);
console.log('done - audit log system + getBalances + getRegisterEntries appended');
