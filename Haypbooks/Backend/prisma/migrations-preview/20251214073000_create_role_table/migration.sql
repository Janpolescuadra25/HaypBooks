-- Create Role table if missing
CREATE TABLE IF NOT EXISTS public."Role" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS role_tenant_name_idx ON public."Role"("tenantId", "name");
