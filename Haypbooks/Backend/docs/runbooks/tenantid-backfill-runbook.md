TenantId Backfill Runbook
==========================

Purpose
-------
This runbook explains how to apply the tenantId backfills and related schema change(s) to production safely, verify them, and roll back if necessary. The migration is idempotent and conservative — it only backfills when a reliable source of tenant identity exists (e.g., Company.tenantId is a valid UUID).

Files
-----
- Migration SQL: `scripts/db/migrations/20260113_add_subscription_tenantid.sql`
- Dev helper script: `scripts/db/backfill-subscription-tenantid.ts` (dry-run default, `--apply` to modify)
- Diagnostic scripts:
  - `scripts/db/find-tenantid-orphans.ts` (scans common tables)
  - `scripts/db/find-tenantid-orphans-all.ts` (scans all tenant* columns)
  - `scripts/db/inspect-tenant-and-company-columns.ts` (discovers tenant/company-like columns)

Preconditions
-------------
- Ensure a full DB snapshot/backup exists and has been tested for restores.
- Confirm the production schema is compatible with the SQL in `20260113_add_subscription_tenantid.sql` (e.g., table names exist).
- Notify stakeholders and schedule a maintenance window (recommended: low-traffic period).

Staging procedure (mandatory)
-----------------------------
1. Restore a recent production snapshot into a staging environment.
2. Run an exhaustive orphan scan to get baseline:

   npm --prefix Backend run db:find-tenantid-orphans-all

3. Review `Subscription` rows with `companyId` and no tenant (samples are printed by the helper).
4. Apply the migration in staging (the SQL is idempotent):

   psql "$STAGING_DB" -f scripts/db/migrations/20260113_add_subscription_tenantid.sql

   or use your migration runner.

5. Verify in staging:
   - Re-run `db:find-tenantid-orphans-all` and `db:inspect-tenant-company` — expect `Subscription` to have tenantId populated where company.tenantId was a valid UUID.
   - Run backend e2e tests and Playwright owner-hub visibility tests.
   - Check business dashboards and billing workflows for anomalies.

6. If issues arise in staging, revert the database snapshot and investigate.

Production apply (ops)
----------------------
1. Take a production DB snapshot immediately before starting (do not rely on automated backups alone).
2. Run the migration SQL:

   psql "$PROD_DB" -f scripts/db/migrations/20260113_add_subscription_tenantid.sql

   Note: the migration adds a nullable `tenantId` column and backfills only when Company.tenantId is a valid UUID. It is safe and idempotent.

3. Verification checks (run immediately after apply):
   - Confirm backfill counts are zero for the target table:

     SELECT COUNT(*) FROM public."Subscription" WHERE "tenantId" IS NULL AND ("companyId" IS NOT NULL OR "company_id" IS NOT NULL);

   - Run `npm --prefix Backend run db:inspect-tenant-company` to get samples and counts.
   - Run focused e2e tests (API scoping) and Playwright tests for owner hub visibility.
   - Monitor logs/alerts for 15–30 minutes for abnormal errors.

Rollback
--------
- If problems are severe, restore the DB from the snapshot taken before the migration.
- If the failure is limited to some rows (e.g., invalid company.tenantId formats), fix those rows manually and re-run migration.

Post-apply
---------
- If verification is green, consider adding a non-concurrent FK/validation in a follow-up migration after you are confident no orphans remain and tenantId types are normalized.
- Add the CI orphan-check job (see `.github/workflows/db-orphan-scan.yml`) to detect regressions early.

Notes / Troubleshooting
-----------------------
- Windows Prisma note: when regenerating the Prisma client or applying Prisma-based migrations, the `query_engine-windows.dll.node` file can be locked. Stop Node processes or restart the machine to clear the lock before running `npx prisma generate`.
- If `company.tenantId` is stored as text (non-UUID), only values matching a UUID pattern will be cast and backfilled; others must be fixed manually.

Contact
-------
- Prepare a short post-mortem including the snapshot id, change set applied, and verification outputs.
