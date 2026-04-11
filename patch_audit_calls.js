const fs = require('fs');
const f = 'Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/mockGLState.ts';
let c = fs.readFileSync(f, 'utf8');

// 1. Add enabled: true, priority to every MOCK_RULE entry
const rules = [
  ['rule-001', 1], ['rule-002', 2], ['rule-003', 3], ['rule-004', 4],
  ['rule-005', 5], ['rule-006', 6], ['rule-007', 7], ['rule-008', 8],
];
for (const [id, priority] of rules) {
  c = c.replace(
    `id: '${id}',`,
    `id: '${id}', enabled: true, priority: ${priority},`
  );
}

// 2. Add addAuditLog call to categorizeTransaction
c = c.replace(
  `  mockJEs = [...mockJEs, je];

  return {
    ...tx,
    status: 'CATEGORIZED',
    transactionType: isDebit ? 'Bank Payment' : 'Bank Receipt',`,
  `  mockJEs = [...mockJEs, je];

  addAuditLog({
    action: 'categorized',
    entityType: 'transaction',
    entityId: tx.id,
    entityDescription: tx.description,
    details: \`Categorized as \${accountName}\${contactName ? ' · ' + contactName : ''}\${ruleName ? ' (rule: ' + ruleName + ')' : ''}\`,
    newValue: accountName,
    oldValue: 'PENDING',
  });

  return {
    ...tx,
    status: 'CATEGORIZED',
    transactionType: isDebit ? 'Bank Payment' : 'Bank Receipt',`
);

// 3. Add addAuditLog call to matchTransaction
c = c.replace(
  `  const je = mockJEs.find(j => j.id === existingJEId);
  const expenseLine = je?.lines.find(l => l.debit > 0);
  return {`,
  `  const je = mockJEs.find(j => j.id === existingJEId);
  const expenseLine = je?.lines.find(l => l.debit > 0);
  addAuditLog({
    action: 'matched',
    entityType: 'transaction',
    entityId: tx.id,
    entityDescription: tx.description,
    details: \`Matched to \${je?.type ?? 'JE'} \${je?.referenceNo ?? existingJEId}\${je?.contactName ? ' · ' + je.contactName : ''}\`,
    newValue: existingJEId,
    oldValue: tx.status,
  });
  return {`
);

// 4. Add addAuditLog call to splitTransaction (after mockJEs = [...mockJEs, je])
c = c.replace(
  `  const sl: MockSplitLine[] = splits.map(s => ({`,
  `  addAuditLog({
    action: 'split',
    entityType: 'transaction',
    entityId: tx.id,
    entityDescription: tx.description,
    details: \`Split into \${splits.length} lines: \${splits.map(s => s.accountName).join(', ')}\`,
    oldValue: 'PENDING',
    newValue: \`Split (\${splits.length})\`,
  });

  const sl: MockSplitLine[] = splits.map(s => ({`
);

// 5. Add addAuditLog call to excludeTransaction
c = c.replace(
  `export function excludeTransaction(tx: MockBankTransaction): MockBankTransaction {
  return {
    ...tx,
    status: 'EXCLUDED',`,
  `export function excludeTransaction(tx: MockBankTransaction): MockBankTransaction {
  addAuditLog({
    action: 'excluded',
    entityType: 'transaction',
    entityId: tx.id,
    entityDescription: tx.description,
    details: 'Excluded from books',
    oldValue: tx.status,
    newValue: 'EXCLUDED',
  });
  return {
    ...tx,
    status: 'EXCLUDED',`
);

// 6. Add addAuditLog call to undoCategorize
c = c.replace(
  `  return {
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
}`,
  `  const undoAction = tx.transactionType === 'Bank Transfer' ? 'untransferred'
    : tx.transactionType === 'Split Transaction' ? 'unsplitted'
    : tx.status === 'MATCHED' ? 'unmatched'
    : 'unmatched';
  addAuditLog({
    action: undoAction as 'unmatched',
    entityType: 'transaction',
    entityId: tx.id,
    entityDescription: tx.description,
    details: \`Undo \${tx.status.toLowerCase()}: reverted to PENDING\`,
    oldValue: tx.status,
    newValue: 'PENDING',
  });
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
}`
);

// 7. Add addAuditLog call in applyRules (inside the loop after newTx is created)
c = c.replace(
  `    const newTx = categorizeTransaction(
      tx,
      rule.accountId,
      rule.accountName,
      rule.contactId,
      rule.contactName,
      rule.memo,
      rule.name,
    );
    updated.push({ ...newTx, id: tx.id });`,
  `    const newTx = categorizeTransaction(
      tx,
      rule.accountId,
      rule.accountName,
      rule.contactId,
      rule.contactName,
      rule.memo,
      rule.name,
    );
    addAuditLog({
      action: 'rule_applied',
      entityType: 'rule',
      entityId: tx.id,
      entityDescription: tx.description,
      details: \`Rule "\${rule.name}" applied → \${rule.accountName}\`,
      newValue: rule.accountName,
    });
    updated.push({ ...newTx, id: tx.id });`
);

// 8. Add addAuditLog call to transferTransaction (after mirrorTx is created)
c = c.replace(
  `  // Add to categorization history
  addToHistory(tx.description, 'transfer-clearing', 'Bank Transfers', 'XFER', null, null);

  return { tx, mirrorTx, je };`,
  `  // Add to categorization history
  addToHistory(tx.description, 'transfer-clearing', 'Bank Transfers', 'XFER', null, null);

  addAuditLog({
    action: 'transferred',
    entityType: 'transaction',
    entityId: txId,
    entityDescription: tx.description,
    details: \`Transfer \${direction === 'to' ? 'to' : 'from'} \${otherAccount.name}\`,
    newValue: otherAccount.name,
  });

  return { tx, mirrorTx, je };`
);

fs.writeFileSync(f, c);
console.log('done - audit log calls added to all action functions');
