-- Add tenant isolation RLS policies to all tables that have a tenantId column but are missing a tenant_isolation_* policy
-- This migration is idempotent and safe to run multiple times in dev/staging. Test thoroughly before applying to production.

DO $$
DECLARE
  r RECORD;
  policy_name TEXT;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE lower(c.column_name) = 'tenantid' AND c.table_schema = 'public'
      AND c.table_name NOT IN (
        SELECT DISTINCT tablename FROM pg_policies WHERE schemaname='public' AND policyname LIKE 'tenant_isolation_%'
      )
  LOOP
    -- Enable RLS on the table
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.table_name);

    policy_name := format('tenant_isolation_%s', r.table_name);

    -- Create the policy if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = policy_name) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))',
        policy_name,
        r.table_name,
        r.column_name,
        r.column_name
      );
    END IF;
  END LOOP;
END
$$;

-- Optional: verify created policies (printed with SELECT)
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname='public' AND policyname LIKE 'tenant_isolation_%' ORDER BY tablename, policyname;
