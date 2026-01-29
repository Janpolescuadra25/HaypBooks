-- Safe rename Tenant -> Workspace
-- This migration is idempotent and guarded to avoid errors on repeated runs.
DO $$
BEGIN
  IF to_regclass('public."Workspace"') IS NULL AND to_regclass('public."Tenant"') IS NOT NULL THEN
    RAISE NOTICE 'Renaming table Tenant to Workspace';
    EXECUTE 'ALTER TABLE public."Tenant" RENAME TO "Workspace"';
  ELSE
    RAISE NOTICE 'No rename needed (Workspace exists or Tenant missing)';
  END IF;
END
$$;
