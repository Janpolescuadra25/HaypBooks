-- Retry: minimal idempotent migration to complete WorkspaceUser tenantId conversion

-- 1) Add and backfill tenantId_new on WorkspaceUser
ALTER TABLE public."WorkspaceUser" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'WorkspaceUser' AND column_name = 'tenantid_old') THEN
    UPDATE public."WorkspaceUser" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL;
  ELSE
    RAISE NOTICE 'WorkspaceUser.tenantId_old missing — skipping populate step';
  END IF;
END
$$;

-- 2) Create unique index to support composite FK
CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceUser_tenant_user_unique" ON public."WorkspaceUser" (tenantId_new, "userId");

-- 3) Add and backfill tenantId_new on CompanyUser and PracticeUser
ALTER TABLE public."CompanyUser" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CompanyUser' AND column_name = 'tenantid_old') THEN
    UPDATE public."CompanyUser" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL;
  ELSE
    RAISE NOTICE 'CompanyUser.tenantId_old missing — skipping populate step';
  END IF;
END
$$;

ALTER TABLE public."PracticeUser" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'PracticeUser' AND column_name = 'tenantid_old') THEN
    UPDATE public."PracticeUser" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL;
  ELSE
    RAISE NOTICE 'PracticeUser.tenantId_old missing — skipping populate step';
  END IF;
END
$$;

-- 4) Add composite FK constraints as NOT VALID if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompanyUser_tenantId_userId_fkey_new') THEN
    EXECUTE 'ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantId_new, "userId") REFERENCES public."WorkspaceUser" (tenantId_new, "userId") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeUser_tenantId_userId_fkey_new') THEN
    EXECUTE 'ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantId_new, "userId") REFERENCES public."WorkspaceUser" (tenantId_new, "userId") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID';
  END IF;
END $$;

-- Notes: validation of the new NOT VALID constraints should be attempted with the validator script to highlight offending rows for remediation.
