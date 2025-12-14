-- 20251213191000_add_company_fks_if_missing/migration.sql
-- Add company_id foreign key constraints if missing (idempotent): checks pg_constraint
DO $$
DECLARE
  r RECORD;
  constraint_name TEXT;
  c_exists INT;
BEGIN
  FOR r IN (
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema='public' AND lower(column_name) = 'companyid'
  ) LOOP
    constraint_name := format('fk_%s_company', r.table_name);
    SELECT count(*) INTO c_exists FROM pg_constraint WHERE conname = constraint_name;
    IF c_exists = 0 THEN
      BEGIN
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY ("companyId") REFERENCES public."Company"(id) NOT VALID', r.table_name, constraint_name);
      EXCEPTION WHEN others THEN
        RAISE WARNING 'Failed to add constraint % on table %: %', constraint_name, r.table_name, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;
