-- Add status to TenantInvite, index on TenantInvite.email and deletedAt to TenantUser (guarded and idempotent)
DO $$
BEGIN
  -- TenantInvite: add status column (default PENDING) if not exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TenantInvite') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TenantInvite' AND column_name = 'status') THEN
      ALTER TABLE public."TenantInvite" ADD COLUMN status TEXT DEFAULT 'PENDING' NOT NULL;
    END IF;

    -- Create an index on email for quick acceptance/lookup
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'TenantInvite' AND indexname = 'tenantinvite_email_idx') THEN
      CREATE INDEX tenantinvite_email_idx ON public."TenantInvite" (email);
    END IF;
  END IF;
END$$;

DO $$
BEGIN
  -- TenantUser: add deletedAt column to support soft deletes (if not exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'TenantUser') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'TenantUser' AND column_name = 'deletedAt') THEN
      ALTER TABLE public."TenantUser" ADD COLUMN "deletedAt" TIMESTAMP WITH TIME ZONE;
    END IF;
  END IF;
END$$;
