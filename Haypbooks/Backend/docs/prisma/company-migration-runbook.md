Company Migration & Backfill Runbook (staging → production)
=========================================================

Purpose: Safely deploy the company FK/tenant constraints with minimal downtime.

Assumptions:
- You have a staging DB snapshot of production.
- You will validate constraints in a maintenance window on prod after backfill.

Steps (staging):
1. Apply migration in staging:

   psql "$STAGING_DATABASE_URL" -f prisma/migrations/20251213170000_company_tenant_integrity/migration.sql

2. Run backfill script in staging:

   npm --prefix "Haypbooks/Backend" run db:backfill:companyIds

3. Run FK validation to ensure companyId values match Company records in staging (this validates constraints and may take time):

   npm --prefix "Haypbooks/Backend" run db:validate:company-fks

4. Run DB ship checks (RLS, schema completeness, seed smoke) and integration tests:

   npm --prefix "Haypbooks/Backend" run ci:db-ship-check

5. Run smoke tests for exports and AR/AP pages (frontend):

   npm --prefix "Haypbooks/Frontend" run test:serial -- src/__tests__/invoices-and-received-payments.export.test.ts

6. If all checks pass, plan the production maintenance window for the last step (FK validation) and a short follow-up.

Production steps (maintenance window scheduled):
1. Apply migration file to prod (same SQL):

   psql "$DATABASE_URL" -f prisma/migrations/20251213170000_company_tenant_integrity/migration.sql

2. Run db backfill in prod using the script:

   npm --prefix "Haypbooks/Backend" run db:backfill:companyIds

3. Validate FK constraints (this will ensure referential integrity and remove NOT VALID state):

   npm --prefix "Haypbooks/Backend" run db:validate:company-fks

4. Run final ship checks and smoke tests using production read-only copies or a count check to ensure nothing is broken.

Rollbacks & Undo:
- If you discover a problem before FK validation, do not run the validation; you can revert the migration by restoring DB from a snapshot queued before the migration.
- If a problem is detected during validation, pause and inspect; if the issue is data mismatches, fix by updating offending rows and re-run validation.

Notes:
- We intentionally leave the FK constraints as NOT VALID at first to avoid long exclusive table locks; this allows background update and checks to complete.
- Triggers will be added and will reject mismatches during inserts/updates; this reduces risk of data drifting during the backfill.
