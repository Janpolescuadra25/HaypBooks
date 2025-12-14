-- 20251215001000_ensure_tenant_invite_table_exists/migration.sql
-- Idempotently create TenantInvite table and indexes if missing

BEGIN;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='TenantInvite') THEN
    CREATE TABLE public."TenantInvite" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" text NOT NULL,
      "email" varchar(320) NOT NULL,
      "roleId" text,
      "invitedBy" text,
      "invitedAt" timestamptz NOT NULL DEFAULT now(),
      "expiresAt" timestamptz,
      "acceptedAt" timestamptz,
      "status" text NOT NULL DEFAULT 'PENDING'
    );
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantinvite_tenantid_idx') THEN
    CREATE INDEX tenantinvite_tenantid_idx ON public."TenantInvite" ("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantinvite_tenantid_email_key') THEN
    CREATE UNIQUE INDEX tenantinvite_tenantid_email_key ON public."TenantInvite" ("tenantId", "email");
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantinvite_tenant') THEN
    ALTER TABLE public."TenantInvite" ADD CONSTRAINT fk_tenantinvite_tenant FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE CASCADE NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantinvite_role') THEN
    ALTER TABLE public."TenantInvite" ADD CONSTRAINT fk_tenantinvite_role FOREIGN KEY ("roleId") REFERENCES public."Role"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantinvite_invitedby') THEN
    ALTER TABLE public."TenantInvite" ADD CONSTRAINT fk_tenantinvite_invitedby FOREIGN KEY ("invitedBy") REFERENCES public."User"("id") ON DELETE SET NULL NOT VALID;
  END IF;
END$$;

