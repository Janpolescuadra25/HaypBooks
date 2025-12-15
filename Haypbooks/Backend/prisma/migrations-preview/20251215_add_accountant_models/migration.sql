-- Migration: add accountant models and user fields
-- Idempotent where possible
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserType') THEN
    CREATE TYPE "UserType" AS ENUM ('STANDARD','ACCOUNTANT');
  END IF;
END$$;

-- Add columns to user
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "userType" "UserType" NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isCertified" boolean DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firmName" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "certification" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "proAdvisorBadge" boolean DEFAULT false;

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

ALTER TABLE public."AccountantClient" ADD CONSTRAINT IF NOT EXISTS "AccountantClient_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES public."User"(id) ON DELETE CASCADE;
ALTER TABLE public."AccountantClient" ADD CONSTRAINT IF NOT EXISTS "AccountantClient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE RESTRICT;
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
ALTER TABLE public."AccountantActivity" ADD CONSTRAINT IF NOT EXISTS "AccountantActivity_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES public."User"(id) ON DELETE CASCADE;
ALTER TABLE public."AccountantActivity" ADD CONSTRAINT IF NOT EXISTS "AccountantActivity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS "AccountantActivity_accountant_created_idx" ON public."AccountantActivity" ("accountantId", "createdAt");
CREATE INDEX IF NOT EXISTS "AccountantActivity_tenantId_idx" ON public."AccountantActivity" ("tenantId");

-- Ensure tenantId index if needed (apply-rls-phase2 will add it, but add here for safety)
CREATE INDEX IF NOT EXISTS "User_tenantId_idx" ON public."User" ("id");

-- Note: RLS policies are applied by scripts/db/apply-rls-phase2.js
