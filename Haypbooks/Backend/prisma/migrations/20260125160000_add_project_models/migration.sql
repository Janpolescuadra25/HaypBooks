-- 20260125160000_add_project_models/migration.sql
-- Create Project, ProjectLine, RevenueRecognitionSchedule tables and tenant RLS policies

-- Create Project table if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'project') THEN
    CREATE TABLE public."Project" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "companyId" uuid,
      "name" text NOT NULL,
      "code" text,
      "status" text NOT NULL DEFAULT 'ACTIVE',
      "startDate" timestamptz,
      "targetEnd" timestamptz,
      "budgetAmount" numeric(20,4),
      "isActive" boolean DEFAULT true,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Project creation failed: %', SQLERRM;
END$$;

-- Create ProjectLine table if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'projectline') THEN
    CREATE TABLE public."ProjectLine" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "projectId" uuid NOT NULL,
      "sourceType" text NOT NULL,
      "sourceId" text NOT NULL,
      "amount" numeric(20,4) NOT NULL,
      "currency" text NOT NULL,
      "postedAt" timestamptz,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'ProjectLine creation failed: %', SQLERRM;
END$$;

-- Create RevenueRecognitionSchedule table if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'revenuerecognitionschedule') THEN
    CREATE TABLE public."RevenueRecognitionSchedule" (
      "id" uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "invoiceLineId" uuid NOT NULL UNIQUE,
      "totalAmount" numeric(20,4) NOT NULL,
      "recognizedToDate" numeric(20,4) NOT NULL DEFAULT 0,
      "schedule" jsonb NOT NULL,
      "createdAt" timestamptz DEFAULT now()
    );
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'RevenueRecognitionSchedule creation failed: %', SQLERRM;
END$$;

-- Indexes and foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='project_tenant_idx') THEN
    CREATE INDEX project_tenant_idx ON public."Project"("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='project_company_idx') THEN
    CREATE INDEX project_company_idx ON public."Project"("companyId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='projectline_project_idx') THEN
    CREATE INDEX projectline_project_idx ON public."ProjectLine"("projectId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='projectline_tenant_idx') THEN
    CREATE INDEX projectline_tenant_idx ON public."ProjectLine"("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='revenuerecognitionschedule_tenant_idx') THEN
    CREATE INDEX revenuerecognitionschedule_tenant_idx ON public."RevenueRecognitionSchedule"("tenantId");
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='Project_tenant_fkey') THEN
    ALTER TABLE public."Project" ADD CONSTRAINT "Project_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='Project_company_fkey') THEN
    ALTER TABLE public."Project" ADD CONSTRAINT "Project_company_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ProjectLine_project_fkey') THEN
    ALTER TABLE public."ProjectLine" ADD CONSTRAINT "ProjectLine_project_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='RevenueRecognitionSchedule_invoiceLine_fkey') THEN
    ALTER TABLE public."RevenueRecognitionSchedule" ADD CONSTRAINT "RevenueRecognitionSchedule_invoiceLine_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES public."InvoiceLine"("id") ON DELETE CASCADE NOT VALID;
  END IF;
EXCEPTION WHEN others THEN NULL;
END$$;

-- Enable RLS and create tenant policies
DO $$
BEGIN
  -- Project
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'project') THEN
    EXECUTE 'ALTER TABLE public."Project" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_Project ON public."Project"';
    EXECUTE 'CREATE POLICY tenant_isolation_Project ON public."Project" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  -- ProjectLine
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'projectline') THEN
    EXECUTE 'ALTER TABLE public."ProjectLine" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_ProjectLine ON public."ProjectLine"';
    EXECUTE 'CREATE POLICY tenant_isolation_ProjectLine ON public."ProjectLine" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;

  -- RevenueRecognitionSchedule
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND lower(table_name) = 'revenuerecognitionschedule') THEN
    EXECUTE 'ALTER TABLE public."RevenueRecognitionSchedule" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS tenant_isolation_RevenueRecognitionSchedule ON public."RevenueRecognitionSchedule"';
    EXECUTE 'CREATE POLICY tenant_isolation_RevenueRecognitionSchedule ON public."RevenueRecognitionSchedule" FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id''::text)) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''::text))';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'RLS policy creation failed: %', SQLERRM;
END$$;
