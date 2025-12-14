-- phase9-rls-policies.sql
-- Enable strict tenant isolation RLS policies on tenant-scoped tables.
-- This migration will enable RLS and create a policy that allows access when
-- the tenant column equals current_setting('hayp.tenant_id')::uuid.

DO $$
DECLARE
  tbl RECORD;
  policy_name TEXT;
BEGIN
  FOR tbl IN
    SELECT table_schema, table_name, min(column_name) AS column_name
    FROM information_schema.columns
    WHERE lower(column_name) IN ('tenantid','tenant_id') AND table_schema = 'public'
    GROUP BY table_schema, table_name
  LOOP
    policy_name := format('tenant_isolation_%s', tbl.table_name);
    -- Enable RLS for the table
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.table_schema, tbl.table_name);
    BEGIN
      -- Create a tenant-based isolation policy (using the exact column name found)
      -- Use text comparison to avoid mismatched type errors across schema variations
      EXECUTE format(
        'CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))'
        , policy_name, tbl.table_schema, tbl.table_name, tbl.column_name, tbl.column_name
      );
    EXCEPTION WHEN duplicate_object THEN
      -- ignore already existing policy
      NULL;
    END;
  END LOOP;
END $$;

-- NOTE: Review generated policies for tables that require cross-tenant access (e.g., global indexes, search tables).
-- In CI / test we use permissive policies elsewhere (see add-test-rls-policies.sql).
