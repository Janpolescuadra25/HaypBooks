-- phase18-timesheet-tenantid.sql
-- Add tenantId to TimeEntry and TimesheetApproval and populate values

ALTER TABLE public."TimeEntry" ADD COLUMN IF NOT EXISTS "tenantId" text;
UPDATE public."TimeEntry" SET "tenantId" = t."tenantId" FROM public."Timesheet" t WHERE t.id = public."TimeEntry"."timesheetId";
ALTER TABLE public."TimeEntry" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "timeentry_tenant_idx" ON public."TimeEntry" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimeEntry_tenant_fkey') THEN
    ALTER TABLE public."TimeEntry" ADD CONSTRAINT "TimeEntry_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public."TimesheetApproval" ADD COLUMN IF NOT EXISTS "tenantId" text;
UPDATE public."TimesheetApproval" SET "tenantId" = t."tenantId" FROM public."Timesheet" t WHERE t.id = public."TimesheetApproval"."timesheetId";
ALTER TABLE public."TimesheetApproval" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "timesheetapproval_tenant_idx" ON public."TimesheetApproval" ("tenantId");
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimesheetApproval_tenant_fkey') THEN
    ALTER TABLE public."TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Apply RLS policies for these newly tenant-scoped tables
DO $$
BEGIN
  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'TimeEntry');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_TimeEntry', 'public', 'TimeEntry', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 'public', 'TimesheetApproval');
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING ((%I)::text = current_setting(''hayp.tenant_id'')) WITH CHECK ((%I)::text = current_setting(''hayp.tenant_id''))', 'tenant_isolation_TimesheetApproval', 'public', 'TimesheetApproval', 'tenantId', 'tenantId');
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
