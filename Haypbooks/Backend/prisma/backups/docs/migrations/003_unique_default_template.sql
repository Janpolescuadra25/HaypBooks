-- Migration: Ensure a single default DocumentTemplate per (companyId, type)
-- Run this in Postgres (psql) against the target database. This uses a partial unique index which Prisma doesn't support directly in the schema.
-- NOTE: This is idempotent (IF NOT EXISTS) and uses CONCURRENTLY to avoid locking.

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS unique_default_template_per_type
ON "DocumentTemplate" ("companyId", "type")
WHERE "isDefault" = true AND "deletedAt" IS NULL;

-- To rollback this migration:
-- DROP INDEX CONCURRENTLY IF EXISTS unique_default_template_per_type;
