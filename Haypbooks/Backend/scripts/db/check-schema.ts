import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const checks = [
    { sql: `SELECT to_regclass('public."Permission"') IS NOT NULL AS exists`, name: 'Permission table' },
    { sql: `SELECT to_regclass('public."RolePermission"') IS NOT NULL AS exists`, name: 'RolePermission table' },
    { sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Invoice' AND column_name='discountAmount'`, name: 'Invoice.discountAmount' },
    { sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='InvoiceLine' AND column_name='discountPercent'`, name: 'InvoiceLine.discountPercent' },
    { sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='PaymentReceived' AND column_name='baseAmount'`, name: 'PaymentReceived.baseAmount' },
    { sql: `SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='JournalEntryLine' AND indexname='journalentryline_tenant_account_journal_idx'`, name: 'JournalEntryLine composite index' },
    { sql: `SELECT 1 FROM "RolePermission" LIMIT 1`, name: 'RolePermission entry exists' },
  ];

  for (const check of checks) {
    try {
      const rows: any = await prisma.$queryRawUnsafe(check.sql);
      const exists = rows && rows.length > 0 && Object.values(rows[0])[0];
      console.log(`${check.name}: ${exists ? 'OK' : 'MISSING'}`);
    } catch (err: any) {
      console.log(`${check.name}: ERROR (${err.message})`);
    }
  }
}

check()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
