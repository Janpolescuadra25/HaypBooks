Purpose: Add tenant isolation RLS policies for all tables that have a tenantId column but lacked tenant_isolation_* policies.

How it works:
- A plpgsql DO block finds all public schema tables with a tenantId column and no tenant_isolation_* policy.
- For each such table it enables ROW LEVEL SECURITY and creates a FOR ALL policy named tenant_isolation_<TableName> with USING and WITH CHECK checking (tenantId)::text = current_setting('hayp.tenant_id').

Testing:
1. Run migrations in a safe dev/staging environment and verify the migration completes:
   - npx prisma migrate dev --name add_missing_tenant_policies
2. Run the verification script to ensure no tables remain missing policies:
   - node scripts/db/check_missing_rls_policies.js

Caveats:
- This migration is idempotent but should be tested in staging before production.
- Some tables may require custom policy logic (e.g., shared/global tables that should be globally readable). Review the list printed by the verification script and adjust per-table policies as needed.
- Back up the database before applying changes in production.
