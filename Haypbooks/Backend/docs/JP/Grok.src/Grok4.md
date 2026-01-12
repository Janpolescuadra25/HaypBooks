# TenantId Backfill — Runbook & Safe Plan 🔧✅

Summary

- Conservative backfill and orphan-detection scripts were added to help populate missing `tenantId` values from related company rows. Both scripts are dry-run by default and are resilient to common table/column naming variants.
- Local dry-runs showed no mass changes; a staged run against real data is required before any production updates.

What was added

- `scripts/db/backfill-tenantid-from-company.ts` — conservative backfill from related `Company.tenantId`. Dry-run default, `--apply` to execute updates.
- `scripts/db/find-tenantid-orphans.ts` — scans common tables and prints counts + sample rows where `tenantId IS NULL`.
- package.json scripts:
  - `db:find-tenantid-orphans`
  - `db:backfill:tenantid-from-company`

How to run (staging first) ⚠️

1. Prepare
   - Ensure you have a recent DB snapshot/backup. Work in staging first.
   - Stop external jobs that may write to the DB during the run if possible.

2. Scan for orphans (dry-run, inspect samples)

```bash
# from project root
npm --prefix Backend run db:find-tenantid-orphans
```

- Inspect the sample rows printed for each table. Confirm rules for inferring tenant from company rows.

3. Run conservative backfill (dry-run, then apply)

```bash
# dry-run (default)
npm --prefix Backend run db:backfill:tenantid-from-company

# apply the changes (run only after manual review & backup)
npm --prefix Backend run db:backfill:tenantid-from-company -- --apply
```

4. Re-scan and validate

- Re-run `db:find-tenantid-orphans` to confirm counts decreased.
- Run a small set of application e2e/backend tests and the `companies` scoping tests to confirm no cross-tenant visibility.

Safety checklist ✅

- [ ] Backup (DB snapshot) taken for target environment
- [ ] Run in staging first and review samples
- [ ] Get product/owner sign-off for ambiguous tables
- [ ] Schedule a maintenance window for production apply
- [ ] Have a tested DB restore plan available

Rollback (if needed)

- Restore DB from the snapshot created before applying updates.

Windows / Prisma note

- If you need to regenerate Prisma client after schema change, you may encounter a Windows file lock on `node_modules/.prisma/client/query_engine-windows.dll.node`. Stop Node processes or restart the machine to clear the lock before running `npm run prisma:generate`.

Next steps (recommended)

1. (Done) Ran orphan scan in dev/staging copy — no tenantId NULL rows remain in scanned tables.
2. (Done) Added subscription.tenantId column and backfilled 5 rows where `company.tenantId` was a valid UUID.
3. Prepare migration and PR for production apply (includes idempotent SQL + verification + rollback plan). See `scripts/db/migrations/20260113_add_subscription_tenantid.sql`.
4. For other tables that require tenant additions, prepare similar migration scripts and include them in the PR.
5. Add a CI/staging job to periodically run `db:find-tenantid-orphans` and alert if counts increase beyond thresholds.

If you want, I can prepare the PR now with the migration SQL, the runbook checklist (backup, maintenance window, commands to run, verification queries), and a playbook for manual follow-ups (if company.tenantId values are not valid UUIDs). Which would you like me to prepare next?
