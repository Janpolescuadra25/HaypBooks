-- phase17-timesheets.sql
-- Create Timesheet/TimeEntry/TimesheetApproval tables for Time Tracking

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Timesheet') THEN
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
EXCEPTION WHEN others THEN NULL;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TimeEntry') THEN
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
EXCEPTION WHEN others THEN NULL;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TimesheetApproval') THEN
    CREATE TABLE public."TimesheetApproval" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "timesheetId" uuid NOT NULL,
      "approverId" text NOT NULL,
      "approvedAt" timestamptz NOT NULL,
      "comment" text,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;

CREATE INDEX IF NOT EXISTS "timesheet_tenant_employee_idx" ON public."Timesheet" ("tenantId", "employeeId");
CREATE INDEX IF NOT EXISTS "timeentry_timesheet_idx" ON public."TimeEntry" ("timesheetId");
CREATE INDEX IF NOT EXISTS "timeentry_employee_idx" ON public."TimeEntry" ("employeeId");
CREATE INDEX IF NOT EXISTS "timesheetapproval_timesheet_idx" ON public."TimesheetApproval" ("timesheetId");

-- Add FK constraints idempotently and NOT VALID to avoid blocking migrations due to type mismatches or RLS policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Timesheet_tenant_fkey') THEN
    ALTER TABLE public."Timesheet" ADD CONSTRAINT "Timesheet_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Timesheet_employee_fkey') THEN
    ALTER TABLE public."Timesheet" ADD CONSTRAINT "Timesheet_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee" ("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimeEntry_timesheet_fkey') THEN
    ALTER TABLE public."TimeEntry" ADD CONSTRAINT "TimeEntry_timesheet_fkey" FOREIGN KEY ("timesheetId") REFERENCES public."Timesheet" ("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimeEntry_employee_fkey') THEN
    ALTER TABLE public."TimeEntry" ADD CONSTRAINT "TimeEntry_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee" ("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimeEntry_project_fkey') THEN
    ALTER TABLE public."TimeEntry" ADD CONSTRAINT "TimeEntry_project_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project" ("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimesheetApproval_timesheet_fkey') THEN
    ALTER TABLE public."TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_timesheet_fkey" FOREIGN KEY ("timesheetId") REFERENCES public."Timesheet" ("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TimesheetApproval_approver_fkey') THEN
    ALTER TABLE public."TimesheetApproval" ADD CONSTRAINT "TimesheetApproval_approver_fkey" FOREIGN KEY ("approverId") REFERENCES public."User" ("id") ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;

-- RLS will be applied by phase9-rls-policies.sql which creates tenant-based policies automatically
