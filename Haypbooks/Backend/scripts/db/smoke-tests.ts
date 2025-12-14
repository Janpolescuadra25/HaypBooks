import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test';

async function query<T = any>(client: Client, sql: string, params?: any[]): Promise<T[]> {
  const res = await client.query(sql, params);
  return res.rows as T[];
}

async function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    // RBAC sanity: Role, Permission, RolePermission exist and at least 1 mapping
    const roleExists = (await query(client, `SELECT 1 FROM information_schema.tables WHERE table_name = 'Role'`)).length > 0
    const permExists = (await query(client, `SELECT 1 FROM information_schema.tables WHERE table_name = 'Permission'`)).length > 0
    const rpExists = (await query(client, `SELECT 1 FROM information_schema.tables WHERE table_name = 'RolePermission'`)).length > 0
    await assert(roleExists, 'Role table missing; run migrations');
    await assert(permExists, 'Permission table missing; run migrations');
    await assert(rpExists, 'RolePermission table missing; run migrations');

    const roles = await query(client, 'SELECT id FROM "Role" LIMIT 1');
    const perms = await query(client, 'SELECT id FROM "Permission" LIMIT 1');
    const rps = await query(client, 'SELECT "roleId", "permissionId" FROM "RolePermission" LIMIT 1');
    await assert(roles.length >= 1, 'No Role rows found');
    await assert(perms.length >= 1, 'No Permission rows found');
    await assert(rps.length >= 1, 'No RolePermission mapping found');

    // Key columns presence checks (examples)
    const invoiceCols = await query(client, `
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Invoice' AND column_name IN ('discountAmount','shippingAmount','otherCharges')
    `);
    const invoiceColSet = new Set(invoiceCols.map(r => (r as any).column_name));
    await assert(invoiceColSet.has('discountAmount'), 'Invoice.discountAmount missing');
    await assert(invoiceColSet.has('shippingAmount'), 'Invoice.shippingAmount missing');
    await assert(invoiceColSet.has('otherCharges'), 'Invoice.otherCharges missing');

    const jelineIndex = await query(client, `
      SELECT indexname FROM pg_indexes WHERE tablename = 'JournalEntryLine'
    `);
    await assert(jelineIndex.length >= 1, 'JournalEntryLine indexes missing');

    // TenantUser invitedBy & status exist
    const tenantUserCols = await query(client, `
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'TenantUser' AND column_name IN ('invitedBy','invitedAt','status')
    `);
    const tenantUserColSet = new Set(tenantUserCols.map(r => (r as any).column_name));
    await assert(tenantUserColSet.has('invitedBy'), 'TenantUser.invitedBy missing');
    await assert(tenantUserColSet.has('invitedAt'), 'TenantUser.invitedAt missing');
    await assert(tenantUserColSet.has('status'), 'TenantUser.status missing');

    // TenantInvite table exists with indexes and unique constraint
    const tenantInviteExist = await query(client, `SELECT 1 FROM information_schema.tables WHERE table_name = 'TenantInvite'`);
    await assert(tenantInviteExist.length >= 1, 'TenantInvite table missing');
    const tenantInviteIndex = await query(client, `SELECT indexname FROM pg_indexes WHERE tablename = 'TenantInvite'`);
    await assert(tenantInviteIndex.length >= 1, 'TenantInvite indexes missing');
    const tenantInviteStatusCol = await query(client, `SELECT column_name FROM information_schema.columns WHERE table_name = 'TenantInvite' AND column_name = 'status'`);
    await assert(tenantInviteStatusCol.length >= 1, 'TenantInvite.status column missing');
    const tenantInviteEmailIdx = await query(client, `SELECT indexname FROM pg_indexes WHERE tablename = 'TenantInvite' AND indexname = 'tenantinvite_email_idx'`);
    await assert(tenantInviteEmailIdx.length >= 1, 'TenantInvite.email index missing');

    // TenantUser deletedAt check
    const tenantUserDeletedAtCol = await query(client, `SELECT column_name FROM information_schema.columns WHERE table_name = 'TenantUser' AND column_name = 'deletedAt'`);
    await assert(tenantUserDeletedAtCol.length >= 1, 'TenantUser.deletedAt missing');

    // CustomerCredit and related tables exist
    const customerCreditExists = await query(client, `SELECT 1 FROM information_schema.tables WHERE table_name = 'CustomerCredit'`);
    await assert(customerCreditExists.length >= 1, 'CustomerCredit table missing');
    const customerCreditLineExists = await query(client, `SELECT 1 FROM information_schema.tables WHERE table_name = 'CustomerCreditLine'`);
    await assert(customerCreditLineExists.length >= 1, 'CustomerCreditLine table missing');
    const customerCreditApplicationExists = await query(client, `SELECT 1 FROM information_schema.tables WHERE table_name = 'CustomerCreditApplication'`);
    await assert(customerCreditApplicationExists.length >= 1, 'CustomerCreditApplication table missing');

    // Check indexes
    const ccTenantIdx = await query(client, `SELECT indexname FROM pg_indexes WHERE tablename = 'CustomerCredit' AND indexname = 'customercredit_tenantid_idx'`);
    await assert(ccTenantIdx.length >= 1, 'CustomerCredit.tenantId index missing');
    const ccLineIdx = await query(client, `SELECT indexname FROM pg_indexes WHERE tablename = 'CustomerCreditLine' AND indexname = 'customercreditline_customercreditid_idx'`);
    await assert(ccLineIdx.length >= 1, 'CustomerCreditLine.customerCreditId index missing');

    // Check FKs exist (may be NOT VALID) and types align
    const fkRows = await query(client, `SELECT conname, convalidated FROM pg_constraint WHERE conname IN ('fk_customercredit_tenant','fk_customercredit_customer','fk_customercredit_company','fk_customercreditline_credit','fk_customercreditline_company','fk_customercreditline_account','fk_customercreditline_tenant')`);
    await assert(fkRows.length >= 1, 'CustomerCredit constraints missing or not added');

    // Column type checks (contact/company id types text)
    const customerIdType = await query(client, `SELECT udt_name FROM information_schema.columns WHERE table_name='CustomerCredit' AND column_name='customerId'`);
    await assert(customerIdType.length >= 1 && customerIdType[0].udt_name === 'text', 'CustomerCredit.customerId should be text');
    const companyIdType = await query(client, `SELECT udt_name FROM information_schema.columns WHERE table_name='CustomerCredit' AND column_name='companyId'`);
    if (companyIdType.length) await assert(companyIdType[0].udt_name === 'text', 'CustomerCredit.companyId expected to be text');

    // Core ID type checks
    const tenantIdType = await query(client, `SELECT udt_name FROM information_schema.columns WHERE table_name='Tenant' AND column_name='id'`);
    await assert(tenantIdType.length >= 1 && tenantIdType[0].udt_name === 'uuid', 'Tenant.id should be uuid');
    const contactIdType = await query(client, `SELECT udt_name FROM information_schema.columns WHERE table_name='Contact' AND column_name='id'`);
    if (contactIdType.length) await assert(contactIdType[0].udt_name === 'text', 'Contact.id should be text');
    const companyIdRootType = await query(client, `SELECT udt_name FROM information_schema.columns WHERE table_name='Company' AND column_name='id'`);
    if (companyIdRootType.length) await assert(companyIdRootType[0].udt_name === 'text', 'Company.id should be text');

    console.log('DB smoke tests passed.');
    // Reconciliation invariants: for any completed reconciliation, check book vs cleared vs closing
    const recRows = await query(client, `SELECT id, "bankAccountId", "statementDate", "closingBalance" FROM "BankReconciliation" WHERE status = 'COMPLETED'`)
    for (const rec of recRows as any[]) {
      const bookBalanceRow = await query(client, `SELECT SUM(j."amount") AS book_balance FROM "JournalEntryLine" j JOIN "JournalEntry" je ON j."journalEntryId" = je.id WHERE je."bankAccountId" = $1`, [rec.bankAccountId])
      const clearedDeltaRow = await query(client, `SELECT SUM(bt.amount) AS cleared_delta FROM "BankReconciliationLine" brl JOIN "BankTransaction" bt ON brl."bankTransactionId" = bt.id WHERE brl."bankReconciliationId" = $1`, [rec.id])
      const bookBalance = bookBalanceRow && bookBalanceRow.length ? Number((bookBalanceRow[0] as any).book_balance || 0) : 0
      const clearedDelta = clearedDeltaRow && clearedDeltaRow.length ? Number((clearedDeltaRow[0] as any).cleared_delta || 0) : 0
      const closingBalance = rec.closingBalance ? Number(rec.closingBalance) : 0
      // bookBalance - clearedDelta should equal closingBalance
      const diff = Number((bookBalance - clearedDelta - closingBalance).toFixed(6))
      await assert(Math.abs(diff) < 0.0001, `Reconciliation invariant failed for ${rec.id}: bookBalance(${bookBalance}) - clearedDelta(${clearedDelta}) != closingBalance(${closingBalance})`)
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('DB smoke tests failed:', err);
  process.exit(1);
});
