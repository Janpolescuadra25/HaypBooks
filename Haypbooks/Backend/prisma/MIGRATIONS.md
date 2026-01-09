HaypBooks Prisma migration plan (phased)

Overview
--------
This folder contains phased SQL migrations and a Prisma schema for migrating from mock repositories to a PostgreSQL-backed implementation.

Phase order (apply in order):

1. Phase 1 (auth): prisma/migrations/phase1-auth.sql — creates User, Session, Otp tables
2. Phase 2 (companies): prisma/migrations/phase2-companies.sql — creates Company, CompanyUser and role enum
3. Phase 3 (accounting): prisma/migrations/phase3-accounting.sql — chart_of_accounts, journal entries, invoices, customers and vendors

Recommended process
-------------------
1. Install Prisma in Backend: npm i prisma @prisma/client
2. Configure DATABASE_URL in .env
3. Run SQL migrations in order against the DB
4. Generate Prisma client: npx prisma generate
5. Wire PrismaRepositoriesModule into AppModule (replace or co-exist with mock module) and update services to use Prisma repos

Validation and tests
--------------------
- Add integration tests to validate login/signup, OTP flows by calling DB-backed endpoints.
- Add e2e tests that use a disposable PostgreSQL instance (docker run postgresql) and clean DB between tests.

Tenant scoping decisions & recent changes
---------------------------------------
- **Completed:** Added `tenantId` to `AccountSubType` (phase22-account-subtype-tenantid.sql), populated values from existing `Account` rows, added FK, index and RLS policy. Prisma schema and seeds updated; migrations applied and seeds verified locally.
- **Decision:** Keep `AccountType` global (no `tenantId`) to preserve stable numeric IDs used by seeds and existing code paths. If at a later date we decide to scope `AccountType`, we will create tenant-specific upserts and migrate `Account.typeId` references accordingly.
- **To do next:** Review remaining models flagged by the audit (`ApiTokenRevocation`, `Currency`, `ExchangeRate`, `JobAttempt`, `DeadLetter`, `Session`, `Otp`, `TaxJurisdiction`, `User`, etc.) and mark each as **tenant-scoped** or **global** with rationale. Implement migrations for those chosen as tenant-scoped.

Scope recommendations (current):
- `AccountSubType`: tenant-scoped (implemented in Phase22).
- `AccountType`: remain global (no `tenantId`) — system-level canonical types referenced by numeric IDs.
- Global/system-scoped (do not add tenantId): `Currency`, `ExchangeRate`, `ApiTokenRevocation`, `DeadLetter`, `JobAttempt`, `Otp`, `Session`, `SchemaMigration`, `TaxJurisdiction`, `User`, `UserSecurityEvent`, `OnboardingStep`.

Rationale for global/system-scoped choices:
- `Currency` & `ExchangeRate`: Financial reference data that should be globally shared across tenants to prevent duplication and ensure consistency.
- `ApiTokenRevocation`, `Session`, `JobAttempt`, `DeadLetter`, `SchemaMigration`: Operational system-level models used to manage backend processes and authentication; scoping them to tenants complicates global behavior (e.g., revoke tokens across tenants, job processing queues, migration tracking).
- `Otp`, `OnboardingStep`: User/session-related records attached to `User` rather than tenant; these are global since `User` is global and multi-tenant membership is modelled via `TenantUser`.
- `User`, `UserSecurityEvent`: `User` is global; tenant membership should remain managed through `TenantUser` and `UserSecurityEvent` remains global because it records user-level events across tenants.

Notes & next steps:
- If any services require tenant-specific variants of these global models (for business or security reasons), we will plan a migration to add `tenantId` to the model, update the schema, and add RLS policies where needed. Migrations must be idempotent and populate the new `tenantId` from referencing rows where available.
- `AccountType` is intentionally global to maintain stable numeric ids used by seed data and application logic. If we decide to tenant-scope `AccountType` it will require: a migration to add `tenantId`, an update to all existing `Account.typeId` references, and migrations for seed/system transitions.

CI enforcement
--------------
- Added a GitHub Actions workflow `.github/workflows/ci-rls-e2e.yml` that runs migrations, seeds, the `check-rls-status` script and the e2e tests on PRs and pushes to `main`. This will help prevent regressions to RLS and tenant-scoping decisions.

- `lint:migrations:rls` is run in CI to ensure migrations enabling tenant-scoped tables include RLS policy creation.

Integrity checks & CI integration
--------------------------------
- Added `scripts/db/integrity-checks.ts` which runs a set of lightweight but important integrity queries (examples include: users with `companyName` but no `TenantUser` link, tenants with no owner, orphaned `TenantUser` rows, duplicate tenant subdomains). The script prints results and exits non-zero when `STRICT_DB_INTEGRITY` is set to `true`.

- The `Backend` CI workflows (`.github/workflows/db-verify.yml` for PRs touching DB/migrations and `.github/workflows/db-validate.yml` on pushes to `main`) are configured to run this script. For PRs the job is strict (PRs will fail on integrity issues), and on `main` the validation is also performed as part of the pipeline. This prevents schema or data drift from being merged unnoticed.

- Operational note: Integrity checks are intentionally non-destructive and provide example rows for triage. For any detected issues, run the relevant backfill scripts (e.g., `scripts/db/backfill-create-tenants-from-users.js`) in a staging environment first and monitor metrics/alerts during a production run.

PR checklist & contributor guidance
-------------------------------
- When adding a new model or migration that adds tenant scoping, ensure it includes: `tenantId` column, FK to tenant, `@@index([tenantId])` on the Prisma model, and an RLS policy enabled in the SQL migration.
- Before creating a PR, run the following commands locally from the `Haypbooks/Backend` folder:

```bash
npm run audit:tenant-fields    # checks for missing tenantId on models that should be tenant-scoped
npm run lint:migrations:rls    # scans SQL migrations for RLS enabling or policies
npm run check-rls-status       # runtime check for RLS enabled/disabled (dev db)
npm run test:e2e               # run e2e suite (includes RLS audit test)
```

If you must intentionally keep a model global (no `tenantId`), add it to the accepted global list in `Haypbooks/Backend/scripts/audit-tenant-fields.ts` with a short justification in your PR.

If you want any of the above to be tenant-scoped, we should plan a migration that:
1) Adds `tenantId` to the model; 2) Populates it from referencing tenant-scoped models where appropriate; 3) Adds index, FK and RLS; 4) Updates seeds/services to create tenant-specific entries.

---

## 2026-01-10: remove tenant onboarding fields
We removed onboarding-related columns from the `Tenant` table and keep onboarding inputs in the `OnboardingStep` table instead.

Dropped columns (idempotent SQL migration):
- businessType, industry, startDate, country, address, taxId
- vatRegistered, vatRate, pricesInclusive, taxFilingFrequency, taxExempt
- logoUrl, invoicePrefix, defaultPaymentTerms, accountingMethod

Use `scripts/db/verify-tenant-columns.js` to confirm the columns are absent in a given database:

  DATABASE_URL="..." node scripts/db/verify-tenant-columns.js

Apply the migration locally with:

  npx prisma migrate deploy

Or using dev mode (will generate migration state):

  npx prisma migrate dev --name remove-tenant-onboarding-fields

---

