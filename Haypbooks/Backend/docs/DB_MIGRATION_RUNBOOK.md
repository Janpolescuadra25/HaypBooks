# Runbook: Backfill Tenant.workspace_name → NOT NULL → Drop Tenant.name

Purpose: Safely make `Tenant.workspace_name` authoritative and remove legacy `Tenant.name`.

Preconditions
- Confirm staging DB snapshot is taken and restore tested.
- Notify ops and schedule maintenance window for staging (and later production).

Steps
1. Set staging DB env for the session:
   - PowerShell: $env:HAYPBOOKS_DATABASE_URL = "postgres://..."
2. Run backfill script:
   - npx ts-node ./scripts/db/backfill-workspace-name.ts
3. Run verification checks:
   - node ./scripts/db/check-workspace-name.js
   - node ./scripts/test/assert-schema.js
   - Confirm report shows 0 missing rows.
4. Deploy NOT NULL migration:
   - Create PR with migration present: `prisma/migrations/20260118_set_tenant_workspace_name_not_null/migration.sql`
   - Deploy migration: `npx prisma migrate deploy`
5. Smoke test staging, then drop the legacy column:
   - Create PR with drop migration: `prisma/migrations/20260118_drop_tenant_name/migration.sql`
   - Deploy migration in maintenance window.
6. Run full CI / integration suites and Playwright e2e (the repository includes a staging-only e2e test: `onboarding.workspace-name-persist.spec.ts`)
7. Monitor logs/metrics for 24–48 hours.
8. Rollback plan:
   - Restore DB snapshot and rollback PRs if critical issues detected.

Notes & Safety
- We added a safety guard in `prisma/seed.ts` to skip creating default roles when a non-UUID tenant id is encountered (prevents test failure for mocked/test tenants).
- Fix failing tests (if any) by ensuring test fixtures using the real DB use proper UUIDs for tenant IDs.
- Avoid removing `Tenant.name` references in code until migration fully applied and verified.

Contact
- Ping @ops and @backend when planning the staging run.
