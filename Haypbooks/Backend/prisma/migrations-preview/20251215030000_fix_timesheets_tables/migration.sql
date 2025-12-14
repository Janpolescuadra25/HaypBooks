-- 20251215030000_fix_timesheets_tables/migration.sql
-- Ensure Timesheet/TimeEntry/TimesheetApproval tables exist and constraints added NOT VALID idempotently

-- Create Timesheet table if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'timesheet') THEN
    CREATE TABLE public."Timesheet" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "employeeId" uuid NOT NULL,
      "weekStart" timestamptz NOT NULL,
      "status" text NOT NULL DEFAULT 'DRAFT',
      "notes" text,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Timesheet creation failed: %', SQLERRM;
END$$;

-- Create TimeEntry table if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'timeentry') THEN
    CREATE TABLE public."TimeEntry" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "timesheetId" uuid NOT NULL,
      "employeeId" uuid NOT NULL,
      "projectId" text,
      "date" timestamptz NOT NULL,
      "hours" numeric(6,2) NOT NULL,
      "description" text,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'TimeEntry creation failed: %', SQLERRM;
END$$;

-- Create TimesheetApproval table if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'timesheetapproval') THEN
    CREATE TABLE public."TimesheetApproval" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "timesheetId" uuid NOT NULL,
      "approverId" text NOT NULL,
      "approvedAt" timestamptz NOT NULL,
      "comment" text,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'TimesheetApproval creation failed: %', SQLERRM;
END$$;

-- Create indexes and add constraints idempotently
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='timesheet_tenant_employee_idx') THEN
    CREATE INDEX timesheet_tenant_employee_idx ON public."Timesheet"("tenantId","employeeId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='timeentry_timesheet_idx') THEN
    CREATE INDEX timeentry_timesheet_idx ON public."TimeEntry"("timesheetId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='timeentry_employee_idx') THEN
    CREATE INDEX timeentry_employee_idx ON public."TimeEntry"("employeeId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='timesheetapproval_timesheet_idx') THEN
    CREATE INDEX timesheetapproval_timesheet_idx ON public."TimesheetApproval"("timesheetId");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='Timesheet_tenant_fkey') THEN
    ALTER TABLE public."Timesheet" ADD CONSTRAINT "Timesheet_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='Timesheet_employee_fkey') THEN
    ALTER TABLE public."Timesheet" ADD CONSTRAINT "Timesheet_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='TimeEntry_timesheet_fkey') THEN
    ALTER TABLE public."TimeEntry" ADD CONSTRAINT "TimeEntry_timesheet_fkey" FOREIGN KEY ("timesheetId") REFERENCES public."Timesheet"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='TimeEntry_employee_fkey') THEN
    ALTER TABLE public."TimeEntry" ADD CONSTRAINT "TimeEntry_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='TimeEntry_project_fkey') THEN
    ALTER TABLE public."TimeEntry" ADD CONSTRAINT "TimeEntry_project_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='TimesheetApproval_timesheet_fkey') THEN
    ALTER TABLE public."TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_timesheet_fkey" FOREIGN KEY ("timesheetId") REFERENCES public."Timesheet"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='TimesheetApproval_approver_fkey') THEN
    ALTER TABLE public."TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_approver_fkey" FOREIGN KEY ("approverId") REFERENCES public."User"("id") ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;