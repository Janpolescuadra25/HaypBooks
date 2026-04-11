import assert from 'node:assert/strict'

import {
  MOCK_BANK_ACCOUNTS,
  MOCK_RULES,
  addAuditLog,
  addManualRegisterEntry,
  addToHistory,
  applyRules,
  auditLog,
  batchDeleteTransactions,
  batchEditAccount,
  batchMatchTransactions,
  categorizeTransaction,
  createRule,
  deleteRule,
  detectAutoMatches,
  editTransactionAccount,
  editTransactionContact,
  editTransactionMemo,
  excludeTransaction,
  findHistoryMatch,
  getAuditLogForEntity,
  getBalances,
  getRegisterEntries,
  importTransactions,
  matchTransaction,
  matchWithDifference,
  mockJEs,
  mockStore,
  moveRule,
  reverseImportedAmounts,
  resetMockState,
  searchForMatch,
  splitTransaction,
  toggleReconciliation,
  toggleRuleEnabled,
  transferTransaction,
  undoCategorize,
  updateRule,
} from '../mockGLState'

type TestCase = {
  name: string
  fn: () => void
}

const tests: TestCase[] = []

function test(name: string, fn: () => void) {
  tests.push({ name, fn })
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function getTx(txId: string) {
  const tx = mockStore.items.find(item => item.id === txId)
  assert.ok(tx, `Expected transaction ${txId} to exist`)
  return tx
}

function getJe(jeId: string) {
  const entry = mockJEs.find(item => item.id === jeId)
  assert.ok(entry, `Expected journal entry ${jeId} to exist`)
  return entry
}

function createManualEntry(amount = 1250, type: 'Debit' | 'Credit' = 'Debit') {
  const created = addManualRegisterEntry({
    bankAccountId: 'acct-bdo',
    date: '2026-04-16',
    description: `Manual Entry ${amount} ${type}`,
    reference: `MAN-${amount}-${type}`,
    amount,
    type,
    accountId: 'acc-5102',
    contactId: 'ent-v001',
    memo: 'Manual E2E seed',
  })
  assert.ok(created, 'Expected manual entry to be created')
  return created
}

function createImportRows(count = 10) {
  return Array.from({ length: count }, (_, index) => ({
    date: `05/${String(index + 1).padStart(2, '0')}/2026`,
    description: `Imported Row ${index + 1}`,
    amount: index % 2 === 0 ? -(index + 1) * 125 : (index + 1) * 250,
    reference: `IMP-${index + 1}`,
  }))
}

test('resetMockState restores the seeded audit log after mutations', () => {
  const seededCount = auditLog.length
  addAuditLog({
    action: 'edited',
    entityType: 'transaction',
    entityId: 'mt-001',
    entityDescription: 'Seed mutation',
    details: 'Temporary audit entry',
  })
  assert.equal(auditLog.length, seededCount + 1)
  resetMockState()
  assert.equal(auditLog.length, seededCount)
})

test('categorizeTransaction creates a generated JE and marks the transaction categorized', () => {
  const tx = getTx('mt-010')
  const before = mockJEs.length
  const updated = categorizeTransaction(tx, 'acc-5102', 'Rent Expense', 'ent-v001', 'MERALCO', 'April payment')

  assert.equal(updated.status, 'CATEGORIZED')
  assert.equal(updated.accountName, 'Rent Expense')
  assert.ok(updated.journalEntryId)
  assert.equal(mockJEs.length, before + 1)
  assert.equal(getJe(updated.journalEntryId).type, 'BankCategorize')
})

test('categorized transactions keep a journalEntryId for register references', () => {
  const updated = categorizeTransaction(getTx('mt-010'), 'acc-5102', 'Rent Expense')
  assert.ok(updated.journalEntryId)
  assert.equal(getJe(updated.journalEntryId).id, updated.journalEntryId)
})

test('categorizeTransaction writes a categorized audit entry', () => {
  categorizeTransaction(getTx('mt-010'), 'acc-5102', 'Rent Expense', 'ent-v001', 'MERALCO')
  assert.ok(getAuditLogForEntity('mt-010').some(entry => entry.action === 'categorized'))
})

test('categorizeTransaction writes a rule_applied audit entry when ruleName is provided', () => {
  categorizeTransaction(getTx('mt-001'), 'acc-5100', 'Utilities Expense', 'ent-v001', 'MERALCO', undefined, 'MERALCO Utility Bills')
  assert.ok(getAuditLogForEntity('mt-001').some(entry => entry.action === 'rule_applied'))
})

test('matchTransaction links to an existing JE and sets matched metadata', () => {
  const updated = matchTransaction(getTx('mt-002'), 'je-bill-002', 'Bank Payment')
  assert.equal(updated.status, 'MATCHED')
  assert.equal(updated.journalEntryId, 'je-bill-002')
  assert.equal(updated.contactName, 'PLDT Enterprise')
})

test('matched transactions store bankRef using the linked JE id', () => {
  const updated = matchTransaction(getTx('mt-002'), 'je-bill-002', 'Bank Payment')
  assert.equal(updated.bankRef, 'je-bill-002')
})

test('matchTransaction writes a matched audit entry', () => {
  matchTransaction(getTx('mt-002'), 'je-bill-002', 'Bank Payment')
  assert.ok(getAuditLogForEntity('mt-002').some(entry => entry.action === 'matched'))
})

test('splitTransaction creates a split JE and split lines', () => {
  const before = mockJEs.length
  const updated = splitTransaction(getTx('mt-010'), [
    { accountId: 'acc-5102', accountName: 'Rent Expense', amount: 3000, memo: 'Rent' },
    { accountId: 'acc-5001', accountName: 'Cost of Goods Sold', amount: 3800, memo: 'Supplies' },
  ])

  assert.equal(updated.transactionType, 'Split Transaction')
  assert.equal(updated.splitLines?.length, 2)
  assert.equal(mockJEs.length, before + 1)
})

test('split transactions keep the generated journalEntryId', () => {
  const updated = splitTransaction(getTx('mt-010'), [
    { accountId: 'acc-5102', accountName: 'Rent Expense', amount: 3000 },
    { accountId: 'acc-5001', accountName: 'Cost of Goods Sold', amount: 3800 },
  ])

  assert.ok(updated.journalEntryId)
  assert.equal(getJe(updated.journalEntryId).type, 'BankSplit')
})

test('excludeTransaction clears accounting fields and marks the transaction excluded', () => {
  const updated = excludeTransaction(getTx('mt-010'))
  assert.equal(updated.status, 'EXCLUDED')
  assert.equal(updated.accountName, undefined)
  assert.equal(updated.journalEntryId, undefined)
})

test('excludeTransaction writes an excluded audit entry', () => {
  excludeTransaction(getTx('mt-010'))
  assert.ok(getAuditLogForEntity('mt-010').some(entry => entry.action === 'excluded'))
})

test('undoCategorize removes generated JEs and reverts to pending', () => {
  const before = mockJEs.length
  const categorized = categorizeTransaction(getTx('mt-010'), 'acc-5102', 'Rent Expense')
  const reverted = undoCategorize(categorized)

  assert.equal(reverted.status, 'PENDING')
  assert.equal(mockJEs.length, before)
})

test('undoCategorize clears journalEntryId on reverted transactions', () => {
  const categorized = categorizeTransaction(getTx('mt-010'), 'acc-5102', 'Rent Expense')
  const reverted = undoCategorize(categorized)

  assert.equal(reverted.journalEntryId, undefined)
})

test('undoCategorize logs unexcluded when restoring an excluded transaction', () => {
  const excluded = excludeTransaction(getTx('mt-010'))
  undoCategorize(excluded)
  assert.ok(getAuditLogForEntity('mt-010').some(entry => entry.action === 'unexcluded'))
})

test('undoCategorize logs unmatched when restoring a matched transaction', () => {
  const matched = matchTransaction(getTx('mt-002'), 'je-bill-002', 'Bank Payment')
  undoCategorize(matched)
  assert.ok(getAuditLogForEntity('mt-002').some(entry => entry.action === 'unmatched'))
})

test('applyRules only categorizes pending transactions', () => {
  const updated = applyRules(mockStore.items)
  assert.ok(updated.length > 0)
  assert.ok(updated.some(tx => tx.id === 'mt-001'))
  assert.ok(updated.every(tx => tx.status === 'CATEGORIZED'))
  assert.ok(!updated.some(tx => tx.id === 'mt-011'))
})

test('applyRules respects disabled rules', () => {
  const toggled = toggleRuleEnabled('rule-001')
  assert.equal(toggled?.enabled, false)
  const updated = applyRules([getTx('mt-001')])
  assert.equal(updated.length, 0)
})

test('applyRules respects rule priority order', () => {
  const created = createRule({
    name: 'MERALCO Override',
    matchKeyword: 'meralco',
    accountId: 'acc-5103',
    transactionType: 'Bank Payment',
  })
  assert.ok(created)

  for (let index = 0; index < MOCK_RULES.length; index += 1) {
    moveRule(created.id, 'up')
  }

  const updated = applyRules([getTx('mt-001')])
  assert.equal(updated[0]?.accountName, 'Meals & Entertainment')
})

test('detectAutoMatches finds exact candidates within the threshold', () => {
  const matches = detectAutoMatches([getTx('mt-002')])
  assert.equal(matches['mt-002']?.[0]?.je.id, 'je-bill-002')
  assert.equal(matches['mt-002']?.[0]?.isExact, true)
})

test('detectAutoMatches skips already-processed transactions', () => {
  const matches = detectAutoMatches([getTx('mt-023')])
  assert.equal(matches['mt-023'], undefined)
})

test('findHistoryMatch returns seeded keyword matches', () => {
  const match = findHistoryMatch('MERALCO PAYMENT REF# 2026-04-001')
  assert.equal(match?.accountId, 'acc-5100')
})

test('addToHistory increments existing history entries', () => {
  const before = findHistoryMatch('MERALCO PAYMENT REF# 2026-04-001')?.count ?? 0
  addToHistory('MERALCO PAYMENT REF# 2026-05-001', 'acc-5100', 'Utilities Expense', '5100', 'ent-v001', 'MERALCO')
  assert.equal(findHistoryMatch('MERALCO PAYMENT REF# 2026-05-001')?.count, before + 1)
})

test('addToHistory creates new history entries for unseen descriptions', () => {
  addToHistory('Office Depot Cubao Supplies', 'acc-5001', 'Cost of Goods Sold', '5001', null, null)
  const match = findHistoryMatch('Office Depot Cubao Supplies')
  assert.ok(match)
  assert.equal(match?.accountId, 'acc-5001')
})

test('transferTransaction updates the source tx and creates mirror + JE records', () => {
  const result = transferTransaction('mt-010', 'acct-bpi', 'to', '2026-04-10', 'Sweep to BPI')
  assert.ok(result)
  assert.equal(result?.tx.transactionType, 'Bank Transfer')
  assert.ok(mockStore.items.some(item => item.id === result?.mirrorTx.id))
  assert.ok(mockJEs.some(entry => entry.id === result?.je.id))
})

test('transfer transactions keep the generated journalEntryId', () => {
  const result = transferTransaction('mt-010', 'acct-bpi', 'to', '2026-04-10', 'Sweep to BPI')
  assert.ok(result?.tx.journalEntryId)
  assert.equal(result?.tx.journalEntryId, result?.je.id)
})

test('transferTransaction writes a transferred audit entry', () => {
  transferTransaction('mt-010', 'acct-bpi', 'to', '2026-04-10', 'Sweep to BPI')
  assert.ok(getAuditLogForEntity('mt-010').some(entry => entry.action === 'transferred'))
})

test('importTransactions creates PENDING entries', () => {
  const result = importTransactions('acct-bdo', createImportRows(10), {
    fileName: 'sample_bank_statement.csv',
    dateFormat: 'MM/DD/YYYY',
  })

  assert.equal(result.imported, 10)
  assert.equal(result.duplicates, 0)

  const imported = mockStore.items.filter(item => item.id.startsWith('TX-IMPORT-'))
  assert.equal(imported.length, 10)
  assert.ok(imported.every(item => item.status === 'PENDING'))
  assert.ok(imported.every(item => item.bankAccountId === 'acct-bdo'))
})

test('importTransactions skips duplicates on repeat import', () => {
  const rows = createImportRows(4)
  const first = importTransactions('acct-bdo', rows, { dateFormat: 'MM/DD/YYYY' })
  const second = importTransactions('acct-bdo', rows, { dateFormat: 'MM/DD/YYYY' })

  assert.equal(first.imported, 4)
  assert.ok(second.duplicates > 0)
  assert.ok(second.imported < first.imported)
})

test('reverseImportedAmounts flips all signs', () => {
  const reversed = reverseImportedAmounts([
    { date: '03/01/2026', description: 'TEST OUT', amount: -5000 },
    { date: '03/02/2026', description: 'TEST IN', amount: 2500 },
  ])

  assert.equal(reversed[0]?.amount, 5000)
  assert.equal(reversed[1]?.amount, -2500)
})

test('searchForMatch returns records matching the query text', () => {
  const results = searchForMatch('PLDT')
  assert.ok(results.some(result => result.je.id === 'je-bill-002'))
})

test('searchForMatch respects type, amount, and date filters', () => {
  const results = searchForMatch('', {
    type: 'Bill',
    amountMin: 4000,
    amountMax: 5000,
    dateFrom: '2026-03-01',
    dateTo: '2026-03-31',
  })

  assert.ok(results.every(result => result.je.type === 'Bill'))
  assert.ok(results.some(result => result.je.id === 'je-bill-002'))
  assert.ok(!results.some(result => result.je.id === 'je-inv-002'))
})

test('batchMatchTransactions links multiple transactions to a single JE', () => {
  const target = batchMatchTransactions(['mt-001', 'mt-005'], 'je-bill-002')
  assert.ok(target)
  assert.equal(getTx('mt-001').status, 'MATCHED')
  assert.equal(getTx('mt-005').journalEntryId, 'je-bill-002')
})

test('batchMatchTransactions writes matched audit entries for every selected transaction', () => {
  batchMatchTransactions(['mt-001', 'mt-005'], 'je-bill-002')
  assert.ok(getAuditLogForEntity('mt-001').some(entry => entry.action === 'matched'))
  assert.ok(getAuditLogForEntity('mt-005').some(entry => entry.action === 'matched'))
})

test('matchWithDifference with write_off creates an adjustment JE', () => {
  const before = mockJEs.length
  const target = matchWithDifference('mt-001', 'je-bill-001', {
    type: 'write_off',
    writeOffAccountId: 'acc-5103',
  })

  assert.ok(target)
  assert.equal(getTx('mt-001').status, 'MATCHED')
  assert.equal(mockJEs.length, before + 1)
  assert.ok(mockJEs.some(entry => entry.description.startsWith('Difference write-off: MERALCO PAYMENT')))
})

test('matchWithDifference with adjust matches without creating an extra JE', () => {
  const before = mockJEs.length
  const target = matchWithDifference('mt-009', 'je-inv-001', { type: 'adjust' })
  assert.ok(target)
  assert.equal(getTx('mt-009').status, 'MATCHED')
  assert.equal(mockJEs.length, before)
})

test('getBalances changes by the manual entry amount while keeping difference stable', () => {
  const before = getBalances('acct-bdo')
  createManualEntry(5000, 'Credit')
  const after = getBalances('acct-bdo')

  assert.equal(after.bankBalance, before.bankBalance + 5000)
  assert.equal(after.booksBalance, before.booksBalance + 5000)
  assert.equal(after.difference, before.difference)
})

test('getRegisterEntries includes manual entries and running balances stay sorted by date', () => {
  const created = createManualEntry(900, 'Debit')
  const entries = getRegisterEntries('acct-bdo')
  const openingBalance = MOCK_BANK_ACCOUNTS.find(account => account.id === 'acct-bdo')?.openingBalance ?? 0
  const expectedEndingBalance = round2(openingBalance + entries.reduce((sum, entry) => sum + entry.amount, 0))

  assert.ok(entries.some(entry => entry.id === created.id))
  assert.ok(entries.every((entry, index) => index === 0 || entries[index - 1].date <= entry.date))
  assert.equal(entries[entries.length - 1]?.runningBalance, expectedEndingBalance)
})

test('toggleReconciliation updates the flag and records an audit event', () => {
  toggleReconciliation('mt-011', false)
  assert.equal(getTx('mt-011').reconciled, false)
  assert.ok(getAuditLogForEntity('mt-011').some(entry => entry.action === 'unreconciled'))
})

test('addManualRegisterEntry creates a categorized manual transaction and JE', () => {
  const beforeTxCount = mockStore.items.length
  const beforeJeCount = mockJEs.length
  const created = createManualEntry(1400, 'Debit')

  assert.equal(created.manualEntry, true)
  assert.equal(created.status, 'CATEGORIZED')
  assert.equal(mockStore.items.length, beforeTxCount + 1)
  assert.equal(mockJEs.length, beforeJeCount + 1)
  assert.ok(getAuditLogForEntity(created.id).some(entry => entry.action === 'manual_entry'))
})

test('editTransactionAccount updates the linked JE account and logs the change', () => {
  const updated = editTransactionAccount('mt-024', 'acc-5103')
  assert.equal(updated?.accountName, 'Meals & Entertainment')
  assert.equal(getJe('je-bill-002').lines[0]?.accountName, 'Meals & Entertainment')
  assert.ok(getAuditLogForEntity('mt-024').some(entry => entry.action === 'categorized'))
})

test('editTransactionContact updates the linked JE contact and logs the change', () => {
  const updated = editTransactionContact('mt-024', 'ent-v003')
  assert.equal(updated?.contactName, 'Globe Telecom')
  assert.equal(getJe('je-bill-002').contactName, 'Globe Telecom')
  assert.ok(getAuditLogForEntity('mt-024').some(entry => entry.action === 'edited'))
})

test('editTransactionMemo updates memo fields and JE description', () => {
  const updated = editTransactionMemo('mt-024', 'Adjusted after review')
  assert.equal(updated?.memo, 'Adjusted after review')
  assert.equal(getJe('je-bill-002').description, 'BDO ONLINE TRF - PLDT BROADBAND — Adjusted after review')
  assert.ok(getAuditLogForEntity('mt-024').some(entry => entry.action === 'edited'))
})

test('batchEditAccount updates every selected transaction', () => {
  const updated = batchEditAccount(['mt-023', 'mt-024'], 'acc-5103')
  assert.equal(updated.length, 2)
  assert.equal(getTx('mt-023').accountName, 'Meals & Entertainment')
  assert.equal(getTx('mt-024').accountName, 'Meals & Entertainment')
})

test('batchDeleteTransactions removes transactions and orphaned generated JEs', () => {
  const created = createManualEntry(2100, 'Debit')
  const journalEntryId = created.journalEntryId
  const removed = batchDeleteTransactions([created.id])

  assert.equal(removed.length, 1)
  assert.ok(!mockStore.items.some(item => item.id === created.id))
  assert.ok(!mockJEs.some(entry => entry.id === journalEntryId))
})

test('getAuditLogForEntity scopes entries to the provided entity id', () => {
  categorizeTransaction(getTx('mt-010'), 'acc-5102', 'Rent Expense')
  matchTransaction(getTx('mt-002'), 'je-bill-002', 'Bank Payment')
  const rentEntries = getAuditLogForEntity('mt-010')

  assert.ok(rentEntries.length > 0)
  assert.ok(rentEntries.every(entry => entry.entityId === 'mt-010'))
})

test('createRule appends a normalized rule and logs creation', () => {
  const created = createRule({
    name: 'Office Depot Supplies',
    matchKeyword: 'office depot',
    accountId: 'acc-5001',
    transactionType: 'Bank Payment',
  })

  assert.ok(created)
  assert.equal(created?.matchKeyword, 'OFFICE DEPOT')
  assert.equal(MOCK_RULES[MOCK_RULES.length - 1]?.id, created?.id)
  assert.ok(getAuditLogForEntity(created!.id).some(entry => entry.action === 'rule_created'))
})

test('updateRule changes account metadata and logs the update', () => {
  const updated = updateRule('rule-001', {
    name: 'MERALCO Meals',
    accountId: 'acc-5103',
  })

  assert.ok(updated)
  assert.equal(updated?.accountName, 'Meals & Entertainment')
  assert.ok(getAuditLogForEntity('rule-001').some(entry => entry.action === 'rule_updated'))
})

test('toggleRuleEnabled flips the enabled state', () => {
  const updated = toggleRuleEnabled('rule-001')
  assert.equal(updated?.enabled, false)
})

test('moveRule reorders priorities and returns the updated list', () => {
  const moved = moveRule('rule-002', 'up')
  assert.equal(moved[0]?.id, 'rule-002')
  assert.equal(moved[0]?.priority, 1)
  assert.equal(moved[1]?.priority, 2)
})

test('deleteRule removes the rule and reindexes priorities', () => {
  const removed = deleteRule('rule-003')
  assert.ok(removed)
  assert.ok(!MOCK_RULES.some(rule => rule.id === 'rule-003'))
  assert.deepEqual(MOCK_RULES.map((rule, index) => rule.priority ?? index + 1), MOCK_RULES.map((_, index) => index + 1))
})

test('resetMockState restores rule ids so new rules restart from the seed counter', () => {
  createRule({
    name: 'Temporary Rule',
    matchKeyword: 'temporary',
    accountId: 'acc-5001',
    transactionType: 'Bank Payment',
  })

  resetMockState()

  const created = createRule({
    name: 'Fresh Rule',
    matchKeyword: 'fresh',
    accountId: 'acc-5001',
    transactionType: 'Bank Payment',
  })

  assert.equal(created?.id, 'rule-009')
})

function run() {
  let passed = 0

  for (const { name, fn } of tests) {
    resetMockState()
    try {
      fn()
      passed += 1
      console.log(`PASS ${name}`)
    } catch (error) {
      console.error(`FAIL ${name}`)
      console.error(error)
    }
  }

  console.log(`\n${passed}/${tests.length} tests passed`)

  if (passed !== tests.length) {
    process.exit(1)
  }
}

run()