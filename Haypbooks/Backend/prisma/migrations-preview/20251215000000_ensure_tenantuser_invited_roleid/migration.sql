-- 20251215000000_ensure_tenantuser_invited_roleid/migration.sql
-- Ensure invitedBy, invitedAt, roleId columns exist on TenantUser and add NOT VALID FKs where appropriate

BEGIN;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TenantUser') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='invitedBy') THEN
      ALTER TABLE public."TenantUser" ADD COLUMN "invitedBy" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='invitedAt') THEN
      ALTER TABLE public."TenantUser" ADD COLUMN "invitedAt" timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='TenantUser' AND column_name='roleId') THEN
      ALTER TABLE public."TenantUser" ADD COLUMN "roleId" text;
    END IF;
  END IF;
END$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_invitedby') THEN
    ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tenantuser_invitedby FOREIGN KEY ("invitedBy") REFERENCES public."User"("id") ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_role') THEN
    ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tenantuser_role FOREIGN KEY ("roleId") REFERENCES public."Role"("id") ON DELETE SET NULL NOT VALID;
  END IF;
END$$;

COMMIT;
