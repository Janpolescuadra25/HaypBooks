# DB RLS Rollout Plan (Phase 2)

This document describes the recommended, safe rollout for adding tenant Row-Level Security (RLS) to the next batch (Phase 2) of tenant-scoped tables.

Goals
- Enforce tenant isolation via RLS policies named `rls_tenant`.
- Add `tenantId` indexes and necessary FK constraints (idempotently).
- Apply changes in small, reviewed batches with CI verification.

Phased approach
1. Preparatory (idempotent)
   - Add indexes on `tenantId` for Phase 2 candidate tables (script: `scripts/db/add-tenant-indexes-phase2.js`).
   - Add or verify any missing foreign keys to `Tenant(id)` where safe.
2. Apply RLS (idempotent)
   - Run `scripts/db/apply-rls-phase2.js` which:
     - ensures tenant FK exists (if types match)
     - enables RLS
     - creates `rls_tenant` policy using `haypbooks.tenant_id` and `haypbooks.rls_bypass` session settings
3. Test and enforce in CI
   - CI runs: recreate a test DB, apply indexes, apply Phase 2 RLS, run `test/rls-*` suites and `scripts/ci/list-missing-rls.js`.
4. Monitor & iterate
   - Use scheduled drift checks (`.github/workflows/db-drift.yml`)
   - Use `scripts/ci/list-missing-rls.js` and `scripts/ci/verify-expected-schema-up-to-date.js` to detect regressions

Notes and safety
- All scripts are idempotent and safe to re-run.
- Avoid adding RLS to tables that are widely used by system processes until those processes are RLS-aware or run with `haypbooks.rls_bypass` set.
- For production rollout, prefer small batches that can be rolled back quickly if issues are found.

Quick run commands
- Locally (safe):

  npm run db:add-tenant-indexes
  npm run db:apply-rls-phase2

- Safe combined command:

  npm run db:apply-phase2-safe

Contact
- For questions or approval to run Phase 2 in production, create a PR referencing this document and request review from the DB/ops team.
