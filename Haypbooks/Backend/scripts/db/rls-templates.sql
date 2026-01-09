-- RLS policy template for tenant-scoped tables. Customize per table.
-- WARNING: adding RLS can restrict access; follow rollout guidance in MIGRATION_NOTES.md

ALTER TABLE "MyTable" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = '"MyTable"'::regclass AND p.polname = 'rls_tenant') THEN
    EXECUTE $$
      CREATE POLICY rls_tenant ON "MyTable"
        USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("tenantId")::text = current_setting('haypbooks.tenant_id', true))
        WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("tenantId")::text = current_setting('haypbooks.tenant_id', true));
    $$;
  END IF;
END$$;
