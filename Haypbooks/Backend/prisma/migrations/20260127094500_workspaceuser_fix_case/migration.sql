-- Fix-case/backfill migration: populate existing lowercase tenantid_new from quoted "tenantId_old" and add composite FK constraints

-- Backfill WorkspaceUser (try mixed-case and lowercase legacy columns)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='WorkspaceUser' AND column_name='tenantId_old') THEN
    UPDATE public."WorkspaceUser" SET tenantid_new = "tenantId_old"::uuid WHERE tenantid_new IS NULL AND "tenantId_old" IS NOT NULL;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='WorkspaceUser' AND column_name='tenantid_old') THEN
    UPDATE public."WorkspaceUser" SET tenantid_new = tenantid_old::uuid WHERE tenantid_new IS NULL AND tenantid_old IS NOT NULL;
  ELSE
    RAISE NOTICE 'WorkspaceUser: no tenantId_old/tenantid_old found — skipping backfill';
  END IF;
END
$$;

-- Ensure unique index exists
CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceUser_tenant_user_unique" ON public."WorkspaceUser" (tenantid_new, "userId");

-- Backfill CompanyUser/PracticeUser from mixed-case or lowercase old column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='CompanyUser' AND column_name='tenantId_old') THEN
    UPDATE public."CompanyUser" SET tenantid_new = "tenantId_old"::uuid WHERE tenantid_new IS NULL AND "tenantId_old" IS NOT NULL;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='CompanyUser' AND column_name='tenantid_old') THEN
    UPDATE public."CompanyUser" SET tenantid_new = tenantid_old::uuid WHERE tenantid_new IS NULL AND tenantid_old IS NOT NULL;
  ELSE
    RAISE NOTICE 'CompanyUser: no tenantId_old/tenantid_old found — skipping backfill';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PracticeUser' AND column_name='tenantId_old') THEN
    UPDATE public."PracticeUser" SET tenantid_new = "tenantId_old"::uuid WHERE tenantid_new IS NULL AND "tenantId_old" IS NOT NULL;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='PracticeUser' AND column_name='tenantid_old') THEN
    UPDATE public."PracticeUser" SET tenantid_new = tenantid_old::uuid WHERE tenantid_new IS NULL AND tenantid_old IS NOT NULL;
  ELSE
    RAISE NOTICE 'PracticeUser: no tenantId_old/tenantid_old found — skipping backfill';
  END IF;
END
$$;

-- Add composite FKs as NOT VALID (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompanyUser_tenantId_userId_fkey_new') THEN
    EXECUTE 'ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantid_new, "userId") REFERENCES public."WorkspaceUser" (tenantid_new, "userId") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeUser_tenantId_userId_fkey_new') THEN
    EXECUTE 'ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantid_new, "userId") REFERENCES public."WorkspaceUser" (tenantid_new, "userId") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID';
  END IF;
END $$;

-- Attempt to VALIDATE the new NOT VALID constraints (best-effort)
DO $$ BEGIN
  BEGIN
    ALTER TABLE public."CompanyUser" VALIDATE CONSTRAINT "CompanyUser_tenantId_userId_fkey_new";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not validate CompanyUser_tenantId_userId_fkey_new: %', SQLERRM;
  END;
  BEGIN
    ALTER TABLE public."PracticeUser" VALIDATE CONSTRAINT "PracticeUser_tenantId_userId_fkey_new";
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not validate PracticeUser_tenantId_userId_fkey_new: %', SQLERRM;
  END;
END $$;
