-- Migration: 20251215120000_add_accountant_models
-- Adds Accountant support: enum, user columns, AccountantClient and AccountantActivity tables
-- Includes RLS enabling + policy creation for safety and CI lints (idempotent SQL)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserType') THEN
    CREATE TYPE "UserType" AS ENUM ('STANDARD','ACCOUNTANT');
  END IF;
END$$;

-- Add columns to user (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='userType') THEN
    ALTER TABLE public."User" ADD COLUMN "userType" "UserType" NOT NULL DEFAULT 'STANDARD';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='isCertified') THEN
    ALTER TABLE public."User" ADD COLUMN "isCertified" boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='firmName') THEN
    ALTER TABLE public."User" ADD COLUMN "firmName" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='certification') THEN
    ALTER TABLE public."User" ADD COLUMN "certification" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='proAdvisorBadge') THEN
    ALTER TABLE public."User" ADD COLUMN "proAdvisorBadge" boolean DEFAULT false;
  END IF;
END$$;

-- Create AccountantClient table
CREATE TABLE IF NOT EXISTS public."AccountantClient" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "accountantId" text NOT NULL,
  "tenantId" text NOT NULL,
  "accessLevel" text NOT NULL DEFAULT 'FULL',
  "invitedBy" text,
  "invitedAt" timestamptz,
  "acceptedAt" timestamptz,
  "status" text NOT NULL DEFAULT 'ACTIVE'
);

-- FKs and indexes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccountantClient_accountantId_fkey') THEN
    ALTER TABLE public."AccountantClient" ADD CONSTRAINT "AccountantClient_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES public."User"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccountantClient_tenantId_fkey') THEN
    ALTER TABLE public."AccountantClient" ADD CONSTRAINT "AccountantClient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE RESTRICT NOT VALID;
  END IF;
END$$;
CREATE UNIQUE INDEX IF NOT EXISTS "AccountantClient_accountant_tenant_uq" ON public."AccountantClient" ("accountantId", "tenantId");
CREATE INDEX IF NOT EXISTS "AccountantClient_tenantId_idx" ON public."AccountantClient" ("tenantId");
CREATE INDEX IF NOT EXISTS "AccountantClient_accountantId_idx" ON public."AccountantClient" ("accountantId");

-- Create AccountantActivity table
CREATE TABLE IF NOT EXISTS public."AccountantActivity" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "accountantId" text NOT NULL,
  "tenantId" text,
  "action" text NOT NULL,
  "details" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccountantActivity_accountantId_fkey') THEN
    ALTER TABLE public."AccountantActivity" ADD CONSTRAINT "AccountantActivity_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES public."User"(id) ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AccountantActivity_tenantId_fkey') THEN
    ALTER TABLE public."AccountantActivity" ADD CONSTRAINT "AccountantActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE RESTRICT NOT VALID;
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS "AccountantActivity_accountant_created_idx" ON public."AccountantActivity" ("accountantId", "createdAt");
CREATE INDEX IF NOT EXISTS "AccountantActivity_tenantId_idx" ON public."AccountantActivity" ("tenantId");

-- Enable RLS for the new tables and ensure tenant policy exists (migration-level safety)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='AccountantClient') THEN
    ALTER TABLE public."AccountantClient" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'AccountantClient' AND p.polname = 'rls_tenant') THEN
    EXECUTE 'CREATE POLICY rls_tenant ON public."AccountantClient" USING (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true)) WITH CHECK (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true))';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='AccountantActivity') THEN
    ALTER TABLE public."AccountantActivity" ENABLE ROW LEVEL SECURITY;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'AccountantActivity' AND p.polname = 'rls_tenant') THEN
    EXECUTE 'CREATE POLICY rls_tenant ON public."AccountantActivity" USING (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true)) WITH CHECK (current_setting(''haypbooks.rls_bypass'', true) = ''1'' OR "tenantId" = current_setting(''haypbooks.tenant_id'', true))';
  END IF;
END$$;

-- Note: apply remaining tenant index, FK and RLS updates via scripts/db/apply-rls-phase2.js if needed
