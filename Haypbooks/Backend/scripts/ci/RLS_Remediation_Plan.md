RLS Remediation Plan — Haypbooks

Goal
---
Add defensible, idempotent tenant-based RLS policies to tenant-scoped tables flagged by `db:drift-check`.

High-level approach
---
1. Discover & scope: confirm which flagged tables actually have a `tenantId` column.
2. Generate idempotent SQL templates (one per table) that:
   - Enable RLS if the table exists and has `tenantId`.
   - Create a `rls_tenant` policy (FOR ALL) using `haypbooks.rls_bypass` and `haypbooks.tenant_id` session config.
3. Validate locally: apply templates on a dev DB (with bypass enabled), run `db:drift-check`, run tests and smoke checks.
4. Staging rollout: apply migrations to staging, run full test suite and manual QA of tenant-only features.
5. Production rollout: schedule small maintenance window, ensure backups, apply migrations, monitor.

Safety notes & rollback
---
- Always take a DB backup before applying RLS changes. Example (run on a host with `pg_dump`):
  - pg_dump -h <host> -U <user> -Fc -f haypbooks_backup_before_rls.dump <dbname>
- Rollback commands per table (if needed):
  - DROP POLICY IF EXISTS rls_tenant ON public."X";
  - ALTER TABLE public."X" DISABLE ROW LEVEL SECURITY;

Testing & validation
---
- Validation steps after applying templates (dev & staging):
  1. Ensure `db:drift-check` no longer lists table(s) as missing RLS.
  2. Run test suites (backend e2e, integration tests).
  3. Run smoke tests (key flows like invoice, payment, payroll).
  4. Validate that app API endpoints for tenant-scoped resources still return expected results when bypass is off and on.

Rollout suggestions
---
- Phase 1 (Low risk): Apply policies with `haypbooks.rls_bypass=1` in session OR cluster-level setting while you run tests to ensure queries succeed.
- Phase 2 (Validation): Run reports and e2e with bypass == 1 and then with bypass == 0 for a subset of endpoints.
- Phase 3 (Gradual enforcement): Remove bypass for read-only flows first, then for writes.

Next steps I can take (choose one):
- Provide a PR-ready set of migration files (one migration per table or grouped in small batches). (I will not push; I’ll prepare files for review locally.)
- Stop here and let you review the generated SQL templates and plan.

If you want me to prepare the PR-ready migration files, say 'prepare migrations' and I will generate them (still local only) and run local validation steps in dev/staging as requested.
