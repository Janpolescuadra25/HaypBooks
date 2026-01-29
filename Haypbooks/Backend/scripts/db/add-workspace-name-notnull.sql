-- After backfill and verification, make workspace_name NOT NULL (run in maintenance window)
-- Preconditions:
-- 1) Confirm zero tenants with NULL/empty workspace_name:
--    SELECT COUNT(*) FROM public."Tenant" WHERE workspace_name IS NULL OR workspace_name = '';
-- 2) Take a DB snapshot/backups.

-- Make column NOT NULL (requires exclusive lock on the table so do during maintenance window):
ALTER TABLE public."Tenant" ALTER COLUMN workspace_name SET NOT NULL;

-- Optional: Add index for lookup performance on lower(workspace_name)
CREATE INDEX IF NOT EXISTS idx_tenant_workspace_name_lower ON public."Tenant" (lower(workspace_name));

-- Revert notes: to undo
-- ALTER TABLE public."Tenant" ALTER COLUMN workspace_name DROP NOT NULL;
-- DROP INDEX IF EXISTS idx_tenant_workspace_name_lower;
