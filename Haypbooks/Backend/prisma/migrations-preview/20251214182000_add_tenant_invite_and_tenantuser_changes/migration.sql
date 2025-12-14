-- 20251214182000_add_tenant_invite_and_tenantuser_changes/migration.sql
-- Adds invitedBy/invitedAt/status to TenantUser and introduces TenantInvite table

BEGIN;

-- TenantUser: add columns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='invitedBy') THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "invitedBy" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='invitedAt') THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "invitedAt" timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='status') THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "status" text NOT NULL DEFAULT 'ACTIVE';
  END IF;
END$$;

-- Add FK for invitedBy to User if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_invitedby') THEN
    ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tenantuser_invitedby FOREIGN KEY ("invitedBy") REFERENCES public."User"("id") ON DELETE SET NULL NOT VALID;
  END IF;
END$$;

-- Create TenantInvite table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='TenantInvite') THEN
    CREATE TABLE public."TenantInvite" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "tenantId" uuid NOT NULL,
      "email" varchar(320) NOT NULL,
      "roleId" uuid,
      "invitedBy" text NOT NULL,
      "invitedAt" timestamptz NOT NULL DEFAULT now(),
      "expiresAt" timestamptz,
      "acceptedAt" timestamptz
    );
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantinvite_tenantid_idx') THEN
    CREATE INDEX tenantinvite_tenantid_idx ON public."TenantInvite"("tenantId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantinvite_tenantid_email_key') THEN
    CREATE UNIQUE INDEX tenantinvite_tenantid_email_key ON public."TenantInvite"("tenantId","email");
  END IF;
END$$;

-- Foreign keys for TenantInvite
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

COMMIT;

-- Notes: Foreign key constraints are created as NOT VALID to allow backfill and avoid immediate validation.
