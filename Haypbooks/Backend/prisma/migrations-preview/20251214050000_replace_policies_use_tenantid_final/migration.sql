-- Final pass: ensure no RLS policies reference tenantId_uuid_old
DO $$
DECLARE
  r RECORD;
  new_qual TEXT;
  new_with TEXT;
BEGIN
  FOR r IN
    SELECT p.polname, n.nspname AS schema_name, c.relname AS table_name,
           pg_get_expr(p.polqual, p.polrelid) AS qual,
           pg_get_expr(p.polwithcheck, p.polrelid) AS withcheck
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE (pg_get_expr(p.polqual, p.polrelid) ILIKE '%tenantId_uuid_old%') OR (pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%tenantId_uuid_old%')
  LOOP
    RAISE NOTICE 'Final replace policy % on %.%', r.polname, r.schema_name, r.table_name;
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.polname, r.schema_name, r.table_name);
    new_qual := replace(r.qual::text, 'tenantId_uuid_old', 'tenantId');
    new_with := replace(coalesce(r.withcheck, ''), 'tenantId_uuid_old', 'tenantId');
    IF new_qual IS NOT NULL AND length(trim(new_qual)) > 0 THEN
      IF length(trim(new_with)) > 0 THEN
        EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s) WITH CHECK (%s)', r.polname, r.schema_name, r.table_name, new_qual, new_with);
      ELSE
        EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s)', r.polname, r.schema_name, r.table_name, new_qual);
      END IF;
    END IF;
  END LOOP;
END $$;
