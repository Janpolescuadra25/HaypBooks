-- Focused WorkspaceUser tenantId conversion (non-destructive)
-- Steps:
-- 1) Add tenantId_new uuid to WorkspaceUser and backfill from tenantId_old::uuid
-- 2) Create UNIQUE index on (tenantId_new, "userId") to allow composite FK references
-- 3) Add tenantId_new to CompanyUser and PracticeUser and backfill
-- 4) Add composite FK constraints to CompanyUser/PracticeUser referencing WorkspaceUser as NOT VALID
-- 5) Attempt best-effort validation of NOT VALID FKs (will leave failing ones NOT VALID)
-- Manual operator steps (after review): drop old FK constraints that reference tenantId_old, drop tenantId_old columns, rename tenantId_new -> tenantId, and recreate constraints/indexes with original names.

DO $do$
DECLARE
  conname_text text;
  tbl text;
BEGIN
  -- 1) Add and backfill tenantId_new on WorkspaceUser
  -- Ensure tenantId_new column exists (even if tenantId_old is absent)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'WorkspaceUser' AND column_name = 'tenantid_new'
  ) THEN
    EXECUTE 'ALTER TABLE public."WorkspaceUser" ADD COLUMN tenantId_new uuid';
  END IF;

  -- Backfill only when tenantId_old exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'WorkspaceUser' AND column_name = 'tenantid_old') THEN
    EXECUTE 'UPDATE public."WorkspaceUser" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL';
  ELSE
    RAISE NOTICE 'WorkspaceUser.tenantId_old missing — skipping WorkspaceUser populate step';
  END IF;

  -- 2) Create unique index for (tenantId_new, userId) if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname = 'WorkspaceUser_tenant_user_unique'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX "WorkspaceUser_tenant_user_unique" ON public."WorkspaceUser" (tenantId_new, "userId")';
  END IF;

  -- 3) Add tenantId_new to CompanyUser and PracticeUser and backfill
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CompanyUser' AND column_name = 'tenantid_new'
  ) THEN
    EXECUTE 'ALTER TABLE public."CompanyUser" ADD COLUMN tenantId_new uuid';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'CompanyUser' AND column_name = 'tenantid_old') THEN
    EXECUTE 'UPDATE public."CompanyUser" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL';
  ELSE
    RAISE NOTICE 'CompanyUser.tenantId_old missing — skipping CompanyUser populate step';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'PracticeUser' AND column_name = 'tenantid_new'
  ) THEN
    EXECUTE 'ALTER TABLE public."PracticeUser" ADD COLUMN tenantId_new uuid';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'PracticeUser' AND column_name = 'tenantid_old') THEN
    EXECUTE 'UPDATE public."PracticeUser" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL';
  ELSE
    RAISE NOTICE 'PracticeUser.tenantId_old missing — skipping PracticeUser populate step';
  END IF;

  -- 4) Add composite FK constraints as NOT VALID (idempotent)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompanyUser_tenantId_userId_fkey_new') THEN
    EXECUTE 'ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantId_new, "userId") REFERENCES public."WorkspaceUser" (tenantId_new, "userId") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeUser_tenantId_userId_fkey_new') THEN
    EXECUTE 'ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantId_new, "userId") REFERENCES public."WorkspaceUser" (tenantId_new, "userId") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID';
  END IF;

  -- 5) Best-effort validate any NOT VALID FKs that involve tenantId_new
  FOR conname_text, tbl IN SELECT pc.conname, pc.conrelid::regclass::text AS tbl
    FROM pg_constraint pc
    WHERE pc.convalidated = false
      AND pc.contype = 'f'
      AND EXISTS (
        SELECT 1 FROM unnest(pc.conkey) WITH ORDINALITY AS ck(attnum, ord)
        JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum
        WHERE pa.attname = 'tenantid_new'
      ) LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', tbl, conname_text);
      RAISE NOTICE 'Validated constraint % on table %', conname_text, tbl;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not validate constraint % on table %: %', conname_text, tbl, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'WorkspaceUser-focused tenantId migration completed (tenantId_new added, backfilled, composite index/constraints added NOT VALID). Manual cleanup steps remain.';
END
$do$;
