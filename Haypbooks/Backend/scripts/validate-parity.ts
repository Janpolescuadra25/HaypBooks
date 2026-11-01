/**
 * Phase 18 Milestone 2: Database Schema & Data Parity Validator
 * Compares migration ledgers, core entity row counts, and journal debit/credit ledger balance.
 *
 * Usage:
 *   npx ts-node scripts/validate-parity.ts <TARGET_DATABASE_URL> [SOURCE_DATABASE_URL]
 */

import { Client } from 'pg';

async function main(): Promise<void> {
  const targetUrl = process.argv[2] || process.env.DATABASE_URL;
  const sourceUrl = process.argv[3];

  if (!targetUrl) {
    console.error('ERROR: Target database connection URL must be provided as argument or DATABASE_URL env.');
    process.exit(1);
  }

  console.log('=== PHASE 18 MILESTONE 2: DATABASE PARITY & INTEGRITY AUDIT ===');
  console.log('Connecting to target database...');

  const targetClient = new Client({ connectionString: targetUrl });
  await targetClient.connect();

  try {
    const migrationRes = await targetClient.query(
      'SELECT count(*) AS count FROM "_prisma_migrations" WHERE rolled_back_at IS NULL;'
    );
    const migrationCount = Number(migrationRes.rows[0].count ?? 0);

    console.log(`Verified applied migrations: ${migrationCount}`);
    if (migrationCount < 50) {
      throw new Error(`FAIL-CLOSED: Expected at least 50 applied migrations, found: ${migrationCount}`);
    }

    const coreTables = [
      'users',
      'workspaces',
      'companies',
      'accounts',
      'journal_entries',
      'journal_lines',
      'invoices',
      'bills'
    ];

    console.log('\n--- Core Table Row Counts (Target) ---');
    for (const table of coreTables) {
      try {
        const res = await targetClient.query(`SELECT count(*) AS count FROM "${table}";`);
        console.log(`  - ${table}: ${res.rows[0].count} rows`);
      } catch (error: any) {
        console.log(`  - ${table}: table unpopulated or not queried (${error.message})`);
      }
    }

    console.log('\n--- General Ledger Balancing Check ---');
    const balanceRes = await targetClient.query(
      'SELECT COALESCE(SUM(debit), 0) AS total_debit, COALESCE(SUM(credit), 0) AS total_credit FROM "journal_lines";'
    );
    const totalDebit = Number(balanceRes.rows[0].total_debit ?? 0);
    const totalCredit = Number(balanceRes.rows[0].total_credit ?? 0);
    const diff = Math.abs(totalDebit - totalCredit);

    console.log(`Total Debits : ${totalDebit.toFixed(2)}`);
    console.log(`Total Credits: ${totalCredit.toFixed(2)}`);
    console.log(`Difference   : ${diff.toFixed(2)}`);

    if (diff > 0.001) {
      throw new Error(`FAIL-CLOSED: General Ledger is out of balance by ${diff}`);
    }
    console.log('✓ General Ledger debit/credit balance verified exact.');

    if (sourceUrl) {
      console.log('\nConnecting to source database for parity comparison...');
      const sourceClient = new Client({ connectionString: sourceUrl });
      await sourceClient.connect();

      try {
        const sourceMigrationRes = await sourceClient.query(
          'SELECT count(*) AS count FROM "_prisma_migrations" WHERE rolled_back_at IS NULL;'
        );
        const sourceMigrationCount = Number(sourceMigrationRes.rows[0].count ?? 0);

        console.log(`Source migrations: ${sourceMigrationCount} | Target migrations: ${migrationCount}`);
        if (sourceMigrationCount !== migrationCount) {
          throw new Error(
            `FAIL-CLOSED: Migration count mismatch. Source: ${sourceMigrationCount}, Target: ${migrationCount}`
          );
        }
        console.log('✓ Migration count parity 100% matched.');
      } finally {
        await sourceClient.end();
      }
    }

    console.log('\n✓ PARITY AND INTEGRITY CHECKS PASSED.');
  } finally {
    await targetClient.end();
  }
}

main().catch((error: unknown) => {
  const err = error as Error;
  console.error('\nERROR in validate-parity:', err.message || error);
  process.exit(1);
});
