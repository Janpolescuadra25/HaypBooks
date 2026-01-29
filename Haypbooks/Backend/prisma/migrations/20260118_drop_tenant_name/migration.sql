-- Idempotent migration: drop legacy Tenant.name column
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='name') THEN
    BEGIN
      ALTER TABLE public."Tenant" DROP COLUMN IF EXISTS name;
      RAISE NOTICE 'Tenant.name dropped';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping drop Tenant.name: %', SQLERRM;
    END;
  END IF;
END$$;