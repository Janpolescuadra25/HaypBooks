-- Add unique index to prevent duplicate Company rows by tenantId + case-insensitive name
-- IMPORTANT: Run only after verifying no duplicates exist. This file is a draft with safety notes.
-- Postgres does not allow CREATE INDEX CONCURRENTLY inside a transaction. Run in maintenance window.

-- 1) Verify no duplicates (recommended query):
-- SELECT tenantId, lower(name) AS lname, count(*) FROM "Company" GROUP BY tenantId, lower(name) HAVING count(*) > 1;

-- 2) Create the index (concurrent; will not block writes but cannot run inside transaction):
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_company_tenant_lower_name ON "Company" ("tenantId", lower(name));

-- 3) Optional: If you prefer strict constraints, consider adding a unique constraint using an expression index or adding a generated column of lower(name) and putting a unique constraint on (tenantId, lower_name). Example (requires downtime for schema change):
-- ALTER TABLE "Company" ADD COLUMN lower_name text GENERATED ALWAYS AS (lower(name)) STORED;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_company_tenant_lower_name ON "Company" ("tenantId", lower_name);

-- Safety & rollback notes:
-- - Take a DB backup/snapshot before running.
-- - If CREATE INDEX CONCURRENTLY fails, it leaves no partial index; re-run after fixing the underlying issue.
-- - Verify application behavior in staging after index creation and before applying in production.
