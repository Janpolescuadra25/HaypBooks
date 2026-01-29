-- Idempotent migration to rename tenantId -> workspaceId on tables that still have tenantId
-- Only renames when tenantId exists and workspaceId does not (safe to re-run)
DO $$
DECLARE
  r RECORD;
  -- helper for dynamic commands
BEGIN
  FOR r IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'tenantId' AND table_schema = 'public'
    ORDER BY table_name
  LOOP
    -- if workspaceId already exists, skip
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = r.table_name AND column_name = 'workspaceId') THEN
      RAISE NOTICE 'Skipping % because workspaceId already exists', r.table_name;
    ELSE
      RAISE NOTICE 'Renaming %."tenantId" to %."workspaceId"', r.table_name, r.table_name;
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN "tenantId" TO "workspaceId"', r.table_name);
    END IF;
  END LOOP;
END$$;

-- Attempt to coalesce any tenantId_old cleanup (only if empty or null)
-- NOTE: We intentionally do NOT drop any tenantId_old columns here automatically; handle in a follow-up after verification.

-- Recreate any missing indexes that might be required on workspaceId columns can be added separately when needed.
