-- Migration: add KPI dashboards and widgets
-- NOTE: Ensure 'pgcrypto' extension (gen_random_uuid) is available in the target DB.

CREATE TABLE IF NOT EXISTS public."KpiDashboard" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyId" uuid NOT NULL,
  "workspaceId" uuid NOT NULL,
  name text NOT NULL,
  "ownerId" uuid NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kpi_dashboard_company ON public."KpiDashboard" ("companyId");
CREATE INDEX IF NOT EXISTS idx_kpi_dashboard_workspace ON public."KpiDashboard" ("workspaceId");

DO $$
DECLARE
  ltype text;
  rtype text;
BEGIN
  -- company FK: add only when column types match
  SELECT pt.typname INTO ltype FROM pg_attribute pa JOIN pg_type pt ON pa.atttypid = pt.oid WHERE pa.attrelid = 'public."KpiDashboard"'::regclass AND pa.attname = 'companyId';
  IF to_regclass('public."Company"') IS NOT NULL THEN
    SELECT pt.typname INTO rtype FROM pg_attribute pa JOIN pg_type pt ON pa.atttypid = pt.oid WHERE pa.attrelid = 'public."Company"'::regclass AND pa.attname = 'id';
  ELSE
    rtype := NULL;
  END IF;
  IF ltype IS NOT NULL AND rtype IS NOT NULL AND ltype = rtype THEN
    ALTER TABLE public."KpiDashboard" ADD CONSTRAINT fk_kpidashboard_company FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON DELETE RESTRICT;
  ELSE
    RAISE NOTICE 'Skipping creation of fk_kpidashboard_company due to missing table or type mismatch (local=%, ref=%)', ltype, rtype;
  END IF;

  -- workspace FK: add only when column types match
  SELECT pt.typname INTO ltype FROM pg_attribute pa JOIN pg_type pt ON pa.atttypid = pt.oid WHERE pa.attrelid = 'public."KpiDashboard"'::regclass AND pa.attname = 'workspaceId';
  IF to_regclass('public."Workspace"') IS NOT NULL THEN
    SELECT pt.typname INTO rtype FROM pg_attribute pa JOIN pg_type pt ON pa.atttypid = pt.oid WHERE pa.attrelid = 'public."Workspace"'::regclass AND pa.attname = 'id';
  ELSE
    rtype := NULL;
  END IF;
  IF ltype IS NOT NULL AND rtype IS NOT NULL AND ltype = rtype THEN
    ALTER TABLE public."KpiDashboard" ADD CONSTRAINT fk_kpidashboard_workspace FOREIGN KEY ("workspaceId") REFERENCES public."Workspace"(id) ON DELETE RESTRICT;
  ELSE
    RAISE NOTICE 'Skipping creation of fk_kpidashboard_workspace due to missing table or type mismatch (local=%, ref=%)', ltype, rtype;
  END IF;
END
$$;

-- Dashboard widgets
CREATE TABLE IF NOT EXISTS public."DashboardWidget" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "dashboardId" uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  config jsonb NOT NULL,
  position integer NOT NULL,
  size text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widget_dashboard ON public."DashboardWidget" ("dashboardId");

ALTER TABLE public."DashboardWidget"
  ADD CONSTRAINT fk_dashboardwidget_dashboard FOREIGN KEY ("dashboardId") REFERENCES public."KpiDashboard"(id) ON DELETE CASCADE;
