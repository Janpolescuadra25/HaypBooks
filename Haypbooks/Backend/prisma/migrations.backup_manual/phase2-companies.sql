-- Phase 2 migration: Companies + company_users + roles
-- Run with: psql $DATABASE_URL -f phase2-companies.sql

CREATE TABLE IF NOT EXISTS "Company" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "taxId" VARCHAR(64),
  address TEXT,
  industry TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS company_name_unique ON "Company" (name);

CREATE TYPE company_role AS ENUM('OWNER','ADMIN','ACCOUNTANT','VIEWER');

CREATE TABLE IF NOT EXISTS "CompanyUser" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  role company_role NOT NULL DEFAULT 'ACCOUNTANT',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_cu_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_cu_company FOREIGN KEY ("companyId") REFERENCES "Company"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS companyuser_user_idx ON "CompanyUser"("userId");
CREATE INDEX IF NOT EXISTS companyuser_company_idx ON "CompanyUser"("companyId");
