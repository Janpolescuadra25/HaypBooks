-- Create AccountingPeriod table if missing
CREATE TABLE IF NOT EXISTS public."AccountingPeriod" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "companyId" TEXT,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS accountingperiod_tenant_idx ON public."AccountingPeriod"("tenantId");
