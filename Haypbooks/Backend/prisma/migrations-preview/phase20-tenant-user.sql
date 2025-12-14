-- phase20-tenant-user.sql
CREATE TABLE IF NOT EXISTS public."TenantUser" (
  "tenantId" uuid NOT NULL,
  "userId" text NOT NULL,
  role TEXT NOT NULL DEFAULT 'ACCOUNTANT',
  "isOwner" boolean DEFAULT false,
  "joinedAt" timestamptz DEFAULT now(),
  PRIMARY KEY ("tenantId", "userId")
);

CREATE INDEX IF NOT EXISTS tenantuser_user_idx ON public."TenantUser"("userId");
CREATE INDEX IF NOT EXISTS tenantuser_tenant_idx ON public."TenantUser"("tenantId");

DO $$
BEGIN
  BEGIN
    ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tu_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tu_user FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
