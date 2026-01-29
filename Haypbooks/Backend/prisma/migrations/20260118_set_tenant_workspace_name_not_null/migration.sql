-- Idempotent migration: set Tenant.workspace_name NOT NULL
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='workspace_name') THEN
    BEGIN
      ALTER TABLE public."Tenant" ALTER COLUMN workspace_name SET NOT NULL;
      RAISE NOTICE 'Tenant.workspace_name set NOT NULL';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping set NOT NULL for Tenant.workspace_name: %', SQLERRM;
    END;
  END IF;
END$$;