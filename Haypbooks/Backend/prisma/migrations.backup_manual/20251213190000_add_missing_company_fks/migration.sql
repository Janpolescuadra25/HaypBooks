-- 20251213190000_add_missing_company_fks/migration.sql
-- Adds missing FK constraints for companyId columns across tables, idempotent and NOT VALID.

DO $$
DECLARE
  r RECORD;
  constraint_name TEXT;
  sql TEXT;
BEGIN
  FOR r IN (
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE lower(column_name) = 'companyid' AND table_schema = 'public'
  ) LOOP
    constraint_name := format('fk_%s_company', r.table_name);
    BEGIN
      sql := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY ("companyId") REFERENCES public."Company"(id) NOT VALID', r.table_schema, r.table_name, constraint_name);
      EXECUTE sql;
    EXCEPTION
      WHEN duplicate_object THEN
        NULL;
      WHEN others THEN
        RAISE WARNING 'Failed to add FK % for %: %', constraint_name, r.table_name, SQLERRM;
    END;
  END LOOP;
END $$;
