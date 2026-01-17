Migration draft: unique index on Company (tenantId, lower(name))

Purpose
- Prevent future duplicate Company rows that only differ in case by enforcing uniqueness per tenant on lower(name).

Preconditions
1. Run `ts-node scripts/db/find-duplicate-companies.ts` and/or `merge-duplicate-companies.ts` (dry-run) to ensure no duplicates remain.
2. Have a recent DB snapshot/backups before applying schema changes.

Apply steps (recommended):
1. Run the dry-run check again in staging.
2. During a maintenance window or low traffic period, run the SQL in `add-unique-company-index.sql` using psql or your DB admin tooling:
   - `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_company_tenant_lower_name ON "Company" ("tenantId", lower(name));`
3. Monitor for any errors; if index creation fails, investigate and resolve underlying data or DB issues then re-run.

Notes
- `CONCURRENTLY` avoids write locks but cannot be run inside a transaction.
- Alternatively, add a stored generated column `lower_name` and add a unique index on (`tenantId`, `lower_name`) if your environment prefers that route.
- After applying, consider adding a CI check to run `find-duplicate-companies.ts` against test DB snapshots and fail CI if duplicates are introduced.

If you'd like, I can open a PR with these files and a short migration plan doc and prepare the exact SQL for your DBA to run.