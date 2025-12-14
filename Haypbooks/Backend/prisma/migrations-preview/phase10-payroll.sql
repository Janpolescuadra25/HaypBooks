-- phase10-payroll.sql
-- Create payroll MVP tables and enable tenant-scoped RLS policies

CREATE TABLE IF NOT EXISTS public."Employee" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "contactId" uuid NULL,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  "ssnHash" text NULL,
  "hireDate" timestamptz NULL,
  "terminationDate" timestamptz NULL,
  "payRate" numeric(12,2) NULL,
  "payType" text NULL,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "employee_tenant_idx" ON public."Employee" ("tenantId");

CREATE TABLE IF NOT EXISTS public."PaySchedule" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  name text NOT NULL,
  frequency text NOT NULL,
  "createdAt" timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "pay_schedule_tenant_idx" ON public."PaySchedule" ("tenantId");

CREATE TABLE IF NOT EXISTS public."PayrollRun" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "payScheduleId" uuid NULL,
  "startDate" timestamptz NOT NULL,
  "endDate" timestamptz NOT NULL,
  status text DEFAULT 'DRAFT',
  "createdAt" timestamptz DEFAULT now(),
  "submittedAt" timestamptz NULL
);

CREATE INDEX IF NOT EXISTS "payroll_run_tenant_status_idx" ON public."PayrollRun" ("tenantId", status);

CREATE TABLE IF NOT EXISTS public."PayrollRunEmployee" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "payrollRunId" uuid NOT NULL,
  "employeeId" uuid NOT NULL,
  "grossAmount" numeric(20,4) NOT NULL,
  "netAmount" numeric(20,4) NOT NULL,
  "createdAt" timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "payroll_run_employee_tenant_idx" ON public."PayrollRunEmployee" ("tenantId");
CREATE INDEX IF NOT EXISTS "payroll_run_employee_employee_idx" ON public."PayrollRunEmployee" ("employeeId");

CREATE TABLE IF NOT EXISTS public."Paycheck" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL,
  "payrollRunId" uuid NULL,
  "employeeId" uuid NOT NULL,
  "checkNumber" text NULL,
  date timestamptz NOT NULL,
  "grossAmount" numeric(20,4) NOT NULL,
  "netAmount" numeric(20,4) NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "postedAt" timestamptz NULL
);

CREATE INDEX IF NOT EXISTS "paycheck_tenant_employee_idx" ON public."Paycheck" ("tenantId", "employeeId");

CREATE TABLE IF NOT EXISTS public."PaycheckLine" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "paycheckId" uuid NOT NULL,
  "lineType" text NOT NULL,
  description text NULL,
  amount numeric(20,4) NOT NULL
);

CREATE INDEX IF NOT EXISTS "paycheck_line_paycheck_idx" ON public."PaycheckLine" ("paycheckId");

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payroll_run_pay_schedule_fk') THEN
    ALTER TABLE public."PayrollRun" ADD CONSTRAINT payroll_run_pay_schedule_fk FOREIGN KEY ("payScheduleId") REFERENCES public."PaySchedule"(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pr_emp_run_fk') THEN
    ALTER TABLE public."PayrollRunEmployee" ADD CONSTRAINT pr_emp_run_fk FOREIGN KEY ("payrollRunId") REFERENCES public."PayrollRun"(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pr_emp_employee_fk') THEN
    ALTER TABLE public."PayrollRunEmployee" ADD CONSTRAINT pr_emp_employee_fk FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paycheck_payroll_run_fk') THEN
    ALTER TABLE public."Paycheck" ADD CONSTRAINT paycheck_payroll_run_fk FOREIGN KEY ("payrollRunId") REFERENCES public."PayrollRun"(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paycheck_employee_fk') THEN
    ALTER TABLE public."Paycheck" ADD CONSTRAINT paycheck_employee_fk FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paycheck_line_paycheck_fk') THEN
    ALTER TABLE public."PaycheckLine" ADD CONSTRAINT paycheck_line_paycheck_fk FOREIGN KEY ("paycheckId") REFERENCES public."Paycheck"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS and create tenant-based policy for these tables
DO $$
DECLARE
  tbl RECORD;
  policy_name TEXT;
BEGIN
  FOR tbl IN SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Employee','PaySchedule','PayrollRun','PayrollRunEmployee','Paycheck')
  LOOP
    policy_name := format('tenant_isolation_%s', tbl.table_name);
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.table_schema, tbl.table_name);
    BEGIN
      EXECUTE format(
        'CREATE POLICY %I ON %I.%I FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id'')) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''))'
        , policy_name, tbl.table_schema, tbl.table_name
      );
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END LOOP;
END $$;
