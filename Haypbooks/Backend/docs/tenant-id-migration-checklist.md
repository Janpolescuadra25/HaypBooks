# Tenant.id -> uuid Migration Checklist

This checklist documents a safe, staged approach to convert the `Tenant.id` column (text) to `uuid`.

## Summary
- The repository contains a suggested migration SQL: `scripts/db/migration-sql/convert-tenant-id-to-uuid.sql`.
- The script `scripts/db/normalize-tenantid-and-suggest-migration.js` validates current `Tenant.id` values are UUID-shaped and writes the suggested SQL.

## Pre-migration verification (required)
1. Take a full logical and physical backup of the database (pg_dump and snapshot if available).
2. Run `node scripts/db/normalize-tenantid-and-suggest-migration.js` to assert all `Tenant.id` values are UUID-shaped. If it reports invalid ids, manually inspect and remediate those rows.
3. Inspect foreign key constraints referencing `Tenant.id` for typing mismatches (text vs uuid). Identify any constraints that may need `ALTER TABLE ... ALTER CONSTRAINT` adjustments.
4. Run DB integrity checks / application smoke tests in a staging environment.

## Migration window & plan
1. Schedule a maintenance window and notify stakeholders.
2. Ensure read/write quiescing strategies (app scaled down or maintenance mode enabled) to avoid concurrent writes that could create inconsistent types.
3. Execute the migration SQL from `scripts/db/migration-sql/convert-tenant-id-to-uuid.sql` in staging first.
4. Run schema & data checks (verify row counts, FK integrity, app tests). Rollback if any issue.
5. Once staging is validated, repeat the process in production with backups in place.

## Post-migration verification
1. Run full test suites (backend e2e, Playwright UI) and smoke endpoints used by tests (e.g., `/api/test/companies`).
2. Monitor application logs and DB metrics for errors for at least the next business day.
3. Increment any migration tracking documents and notify team of completion.

## Rollback guidance
- If irreversible corruption occurs, restore from the pre-migration backup and follow the rollback procedures.

---
If you'd like, I can create a PR that includes this doc and the migration SQL, and optionally add a short `README` note explaining how an operator runs the check and migration in staging/production.