const fs = require('fs');
const f = 'Haypbooks/Frontend/src/app/(owner)/banking-cash/transactions/mockGLState.ts';
let c = fs.readFileSync(f, 'utf8');
c = c.replace("export const MOCK_BANK_ACCOUNTS = [", "export const MOCK_BANK_ACCOUNTS: MockBankAccount[] = [");
c = c.replace("name: 'BDO Checking',", "name: 'BDO Current Account',");
// Add openingBalance + currency to each entry
c = c.replace(
  "balance: 150_000 },\n  { id: 'acct-bpi',",
  "balance: 150_000, openingBalance: 200_000, currency: 'PHP' },\n  { id: 'acct-bpi',"
);
c = c.replace(
  "balance:  45_000 },\n  { id: 'acct-metrobank',",
  "balance:  45_000, openingBalance: 150_000, currency: 'PHP' },\n  { id: 'acct-metrobank',"
);
c = c.replace(
  "balance: 280_000 },\n]\n\n// \u2500\u2500\u2500 Transfer Transaction",
  "balance: 280_000, openingBalance: 500_000, currency: 'PHP' },\n]\n\n// \u2500\u2500\u2500 Transfer Transaction"
);
fs.writeFileSync(f, c);
console.log('done - MOCK_BANK_ACCOUNTS updated');
