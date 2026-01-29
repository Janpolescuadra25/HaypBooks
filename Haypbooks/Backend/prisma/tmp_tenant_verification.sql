-- List RLS policies in public schema
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;

-- List all tables that have a tenantId column
SELECT table_name FROM information_schema.columns WHERE column_name='tenantId' AND table_schema='public' ORDER BY table_name;

-- Tables that have tenantId but are missing tenant_isolation_* policy
SELECT DISTINCT c.table_name FROM information_schema.columns c
WHERE c.column_name='tenantId' AND c.table_schema='public' AND c.table_name NOT IN (
  SELECT DISTINCT tablename FROM pg_policies WHERE schemaname='public' AND policyname LIKE 'tenant_isolation_%'
) ORDER BY c.table_name;

-- RLS-enabled tables (relrowsecurity = true)
SELECT c.relname AS table_name FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname='public' AND c.relrowsecurity = true ORDER BY c.relname;

-- Check constraints related to company/practice scope or XOR checks
SELECT tc.constraint_name, tc.table_name, cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type='CHECK' AND (
  cc.check_clause ILIKE '%companyId%' OR cc.check_clause ILIKE '%practiceId%' OR
  cc.constraint_name ILIKE '%scope%' OR cc.constraint_name ILIKE '%xor%'
)
ORDER BY tc.table_name;
