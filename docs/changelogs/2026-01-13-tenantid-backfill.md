TenantId backfill (2026-01-13)

- Added idempotent migration `20260113_add_subscription_tenantid.sql` to add nullable `tenantId` to `Subscription` and backfill from `Company.tenantId` when it is a valid UUID.
- Added diagnostic and backfill scripts: `backfill-subscription-tenantid.ts`, `find-tenantid-orphans-all.ts`, `inspect-tenant-and-company-columns.ts`.
- Added CI orphan-check script and workflow to detect regressions (`ci:check-tenant-orphans` and `.github/workflows/db-orphan-scan.yml`).
- Runbook and verification steps added to `docs/runbooks/tenantid-backfill-runbook.md`.

Applied changes in dev: added column and backfilled 5 subscriptions where `company.tenantId` was a valid UUID.
