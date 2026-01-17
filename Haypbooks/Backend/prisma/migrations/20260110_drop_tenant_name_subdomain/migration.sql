-- Drop tenant.name and tenant.subdomain to make Tenant a pure hub entity
DO $$
BEGIN
  -- Drop unique index on subdomain if it exists
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname = 'Tenant_subdomain_key') THEN
    EXECUTE 'DROP INDEX IF EXISTS "Tenant_subdomain_key"';
  END IF;

  -- Drop the columns if present
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='subdomain') THEN
    ALTER TABLE public."Tenant" DROP COLUMN IF EXISTS "subdomain";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='name') THEN
    ALTER TABLE public."Tenant" DROP COLUMN IF EXISTS "name";
  END IF;
END $$;
