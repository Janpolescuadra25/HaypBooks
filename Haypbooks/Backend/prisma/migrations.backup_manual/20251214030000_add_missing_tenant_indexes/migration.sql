-- Idempotent migration to ensure tenantId indexes exist for missing tables
-- Safe to re-run; uses IF NOT EXISTS checks.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantuser_tenant_idx') THEN
    CREATE INDEX IF NOT EXISTS tenantuser_tenant_idx ON public."TenantUser" ("tenantId");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'timesheetapproval_tenant_idx') THEN
    CREATE INDEX IF NOT EXISTS timesheetapproval_tenant_idx ON public."TimesheetApproval" ("tenantId");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'paycheckline_tenant_idx') THEN
    CREATE INDEX IF NOT EXISTS paycheckline_tenant_idx ON public."PaycheckLine" ("tenantId");
  END IF;
END $$;
