Title: Add Subscription.tenantId backfill + orphan-detection CI

Summary
-------
This PR adds an idempotent migration to add a nullable `tenantId` to `Subscription` and to backfill it from `Company.tenantId` when the latter is a valid UUID. It also includes diagnostic scripts, a runbook, a CI orphan-check job, and changelog entries.

Files of interest
-----------------
- `scripts/db/migrations/20260113_add_subscription_tenantid.sql` (idempotent migration)
- `scripts/db/backfill-subscription-tenantid.ts` (dev helper; dry-run by default, `--apply` to apply)
- `scripts/db/find-tenantid-orphans*.ts`, `scripts/db/inspect-tenant-and-company-columns.ts` (diagnostics)
- `scripts/ci/check-tenantid-orphans.ts` (CI checker)
- `.github/workflows/db-orphan-scan.yml` (weekly and on-push scan)
- `docs/runbooks/tenantid-backfill-runbook.md` (runbook)
- `docs/changelogs/2026-01-13-tenantid-backfill.md` (changelog)
- `docs/JP/Grok.src/Grok4.md` (updated guidance)

What I ran in dev
-----------------
- Added `Subscription.tenantId` in dev and backfilled 5 subscription rows where `company.tenantId` contained a valid UUID.
- Ran `db:find-tenantid-orphans-all` and `db:inspect-tenant-company` — no tenantId NULL rows remain.
- Ran focused API e2e tests for companies scoping — all passed.

Verification steps for reviewers
--------------------------------
1. Run the exhaustive orphan scan locally or in staging:
   - `npm --prefix Backend run db:find-tenantid-orphans-all`
2. Apply migration in staging and verify:
   - `psql "$STAGING_DB" -f scripts/db/migrations/20260113_add_subscription_tenantid.sql`
   - `npm --prefix Backend run db:inspect-tenant-company`
   - Re-run e2e tests and Playwright owner-workspace tests.
3. If staging is green, schedule and apply in production following the runbook.

Rollback plan
-------------
- Restore DB from pre-migration snapshot. The migration is idempotent, but restoration is the recommended rollback.

Notes
-----
- Company.tenantId may be stored as text; only values matching a UUID pattern are cast and backfilled. Any remaining rows with non-UUID tenant values will require manual fixes.
- If you want, I can add more tables to the same PR or submit additional follow-ups for other tenant-less tables.

If you'd like me to open the PR on your behalf, grant push access or provide a GitHub token/CLI auth; otherwise please push the branch and open the PR with the body above.
