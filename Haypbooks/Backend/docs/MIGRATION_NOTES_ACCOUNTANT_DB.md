# Accountant DB Migrations & Rollout Runbook

Summary
- Adds `AccountantClient`, `AccountantActivity`, `ProAdvisorPerk`, plus fields on `User` (userType, proAdvisorBadge, etc.) and `Tenant`-scoped indexes.
- Migrations are idempotent, include RLS policy additions, and use DO $$ BEGIN ... EXCEPTION ... END $$ to be safe for incremental application.

Pre-deploy checks
1. Run linters and migration checks locally:
   - npm run lint:migrations:rls
   - npm run verify:expected-schema
2. Run migrations against a staging DB: node ./scripts/migrate/init-db.js --recreate && node ./scripts/migrate/run-sql.js
3. Run full seed: npm run db:seed:dev
4. Run backend e2e: npm run test:e2e (ensure `test/payroll.submit.e2e-spec.ts` passes)

Deployment (recommended)
1. Push migration files and open PR (include this runbook and tests). Ensure CI job `Backend e2e tests` passes.
2. Apply migrations in production during a maintenance window; apply one migration at a time if necessary.
3. Run `scripts/ci/check-rls-status` after migrations to verify RLS was enabled for tenant-scoped tables.
4. Seed ProAdvisorPerks only if required (use targeted SQL insert or admin UI).

Backout plan
- If migration fails partially, revert by restoring DB from pre-migration backup and revert the code changes.
- Do not attempt to manually remove migration statements that partially applied unless you fully understand constraints and state.

Notes about test harness changes
- Added retries to `scripts/test/setup-test-db.js` and `scripts/migrate/run-sql.js` to handle transient DB connection resets seen in CI/local runs.
- Added a small PG health-check after seeding to ensure DB accepts connections before tests start; this reduces transient failures.

RLS rollout guidance
- New tenant-scoped tables were added with RLS policies in the migration SQL; for Phase 2 RLS candidates ensure policies are validated by running `node ./scripts/rls/ensure-policies.js` (if present).
- If the table is used in production across tenants, enable RLS in a staged approach: create policies, validate them on a staging tenant, then apply to production.

Testing & Validation
- The PR includes regression tests to prevent reintroduction of the issue where tenant deletion was blocked by dependent records after payroll runs.
- Add a CI job that runs migrations + seed + e2e on PRs that touch `prisma/**` or `scripts/**`.

Contact
- If you need help applying migrations in production or run into RLS issues, tag the DB/Infra team and include the migration file names and failing SQL statements.

---

## Removal of Accountant legacy (post-cleanup)

We removed the legacy accountant-specific models and fields as part of moving to a unified Companies & Clients model.

What changed:
- Added migration `20251217120000_remove_accountant_models/migration.sql` which:
  - Drops `AccountantClient`, `AccountantActivity`, `ProAdvisorPerk` tables
  - Drops related RLS policies and indexes
  - Drops user columns `userType`, `isCertified`, `firmName`, `certification`, `proAdvisorBadge`
  - Drops unused enums `UserType`, `AccountantAccessLevel`, `PerkType`

Reviewer checklist:
- Confirm `prisma/schema.prisma` no longer references accountant models/fields.
- Confirm `prisma/migrations/*` contains the new removal migration and it is idempotent.
- Ensure `prisma/seed.ts` has been updated to avoid inserting Accountant artifacts (seed guards in place).
- Confirm all accountant endpoints/modules have been removed (`src/accountant/*`) and any related tests have been removed or updated.
- Run `node ./scripts/migrate/init-db.js --recreate && node ./scripts/migrate/run-sql.js && npm run db:seed:dev` locally and verify the CI sanity check (`node scripts/db/ci-sanity-check.js`) and a small focused e2e subset pass.
- Confirm PR description explains the behavior and rollback steps.

Notes:
- This is a backward-incompatible change for any external integrators relying on accountant-specific APIs; make sure to communicate via changelog and release notes.
- Keep a DB backup snapshot prior to running the removal migration in production.
