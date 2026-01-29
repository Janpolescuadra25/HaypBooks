-- Migration draft: add workspace_name to Tenant and backfill from name
-- Run in maintenance window; test in staging first.

-- 1) Add new nullable column (non-blocking)
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS workspace_name text;

-- 2) Backfill from existing name column (run after verifying result in staging)
-- UPDATE "Tenant" SET workspace_name = name WHERE workspace_name IS NULL;

-- 3) Optional: If you want to enforce presence, run after backfill and verification:
-- ALTER TABLE "Tenant" ALTER COLUMN workspace_name SET NOT NULL;

-- NOTES:
-- - Do not drop or rename the existing "name" column until application code has been
--   updated across repo to use "workspace_name" and deployed.
-- - Consider adding an index on workspace_name if you will query by it frequently:
-- CREATE INDEX IF NOT EXISTS idx_tenant_workspace_name ON "Tenant" (lower(workspace_name));
