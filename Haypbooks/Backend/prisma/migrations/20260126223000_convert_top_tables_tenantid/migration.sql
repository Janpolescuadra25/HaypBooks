-- Convert tenantId_old -> tenantId (uuid) for top blockers
-- Aimed tables: WorkspaceUser (composite), Company, JournalEntry, JournalEntryLine
-- Strategy (safe-step):
-- 1) Add tenantId_new uuid columns and populate from tenantId_old::uuid
-- 2) Add UNIQUE constraints / indexes where needed (WorkspaceUser composite unique)
-- 3) Add tenantId_new columns on referencing tables and populate
-- 4) Create FK constraints referencing new columns as NOT VALID
-- 5) VALIDATE constraints when safe
-- 6) Drop old FK constraints that reference tenantId_old and drop tenantId_old columns
-- 7) Rename tenantId_new -> tenantId and recreate original indexes with original names

DO $$
DECLARE
  conname_text text;
  tbl text;
  r RECORD;
  v_cnt INT;
BEGIN
  RAISE NOTICE 'Starting targeted tenantId conversion for WorkspaceUser, Company, JournalEntry, JournalEntryLine';

  -- 0. Sanity check: ensure tenantId_old exists on target tables
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='WorkspaceUser' AND lower(column_name) = 'tenantid_old') THEN

    -- ========================
    -- WorkspaceUser (composite)
    -- ========================
    -- 1) add tenantId_new
    ALTER TABLE public."WorkspaceUser" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
    -- 2) populate tenantId_new
    UPDATE public."WorkspaceUser" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL;
    -- 3) create unique constraint for new composite (tenantId_new, userId) to allow FK referencing
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint pc JOIN pg_class c ON pc.conrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE pc.contype = 'u' AND n.nspname = 'public' AND c.relname = 'WorkspaceUser' AND pc.conname = 'WorkspaceUser_tenant_user_unique'
    ) THEN
      ALTER TABLE public."WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_tenant_user_unique" UNIQUE (tenantId_new, userId);
    ELSE
      RAISE NOTICE 'WorkspaceUser composite unique already exists';
    END IF;

    -- 4) Add tenantId_new to referencing tables and populate
    -- CompanyUser
    ALTER TABLE public."CompanyUser" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
    UPDATE public."CompanyUser" cu SET tenantId_new = cu.tenantId_old::uuid WHERE cu.tenantId_new IS NULL AND cu.tenantId_old IS NOT NULL;
    -- PracticeUser
    ALTER TABLE public."PracticeUser" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
    UPDATE public."PracticeUser" pu SET tenantId_new = pu.tenantId_old::uuid WHERE pu.tenantId_new IS NULL AND pu.tenantId_old IS NOT NULL;

    -- 5) Add FK constraints referencing WorkspaceUser (tenantId_new, userId) as NOT VALID to avoid long locks
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CompanyUser_tenantId_userId_fkey_new') THEN
      ALTER TABLE public."CompanyUser" ADD CONSTRAINT "CompanyUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantId_new, userId) REFERENCES public."WorkspaceUser"(tenantId_new, userId) ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PracticeUser_tenantId_userId_fkey_new') THEN
      ALTER TABLE public."PracticeUser" ADD CONSTRAINT "PracticeUser_tenantId_userId_fkey_new" FOREIGN KEY (tenantId_new, userId) REFERENCES public."WorkspaceUser"(tenantId_new, userId) ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;
    END IF;

    RAISE NOTICE 'WorkspaceUser steps done (tenantId_new added, unique constraint created, referencing tables updated, temp FKs added NOT VALID)';
  ELSE
    RAISE NOTICE 'WorkspaceUser.tenantId_old missing — skipping WorkspaceUser section';
  END IF;

  -- ========================
  -- Company
  -- ========================
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Company' AND lower(column_name) = 'tenantid_old') THEN
    ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
    UPDATE public."Company" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL;

    -- Add FK (tenantId_new -> Tenant.id) NOT VALID
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Company_tenantId_fkey_new') THEN
      ALTER TABLE public."Company" ADD CONSTRAINT "Company_tenantId_fkey_new" FOREIGN KEY (tenantId_new) REFERENCES public."Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
    END IF;

    RAISE NOTICE 'Company tenantId_new added and FK created NOT VALID';
  ELSE
    RAISE NOTICE 'Company.tenantId_old missing — skipping Company section';
  END IF;

  -- ========================
  -- JournalEntry & JournalEntryLine
  -- ========================
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='JournalEntry' AND lower(column_name) = 'tenantid_old') THEN
    ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
    UPDATE public."JournalEntry" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalEntry_tenantId_fkey_new') THEN
      ALTER TABLE public."JournalEntry" ADD CONSTRAINT "JournalEntry_tenantId_fkey_new" FOREIGN KEY (tenantId_new) REFERENCES public."Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
    END IF;

    ALTER TABLE public."JournalEntryLine" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
    UPDATE public."JournalEntryLine" SET tenantId_new = tenantId_old::uuid WHERE tenantId_new IS NULL AND tenantId_old IS NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JournalEntryLine_tenantId_fkey_new') THEN
      ALTER TABLE public."JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_tenantId_fkey_new" FOREIGN KEY (tenantId_new) REFERENCES public."Tenant"(id) ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
    END IF;

    RAISE NOTICE 'JournalEntry & JournalEntryLine tenantId_new added and FKs created NOT VALID';
  ELSE
    RAISE NOTICE 'JournalEntry.tenantId_old missing — skipping JournalEntry / JournalEntryLine section';
  END IF;

  -- ========================
  -- Validate constraints where possible (best-effort)
  -- ========================
  PERFORM (
    SELECT 1
    FROM pg_constraint pc
    WHERE pc.convalidated = false
      AND pc.contype = 'f'
      AND EXISTS (
        SELECT 1 FROM unnest(pc.conkey) WITH ORDINALITY AS ck(attnum, ord)
        JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum
        WHERE pa.attname = 'tenantId_new'
      )
    LIMIT 1
  );

  -- Attempt to validate all NOT VALID tenantId_new FKs (will skip ones that still fail)
  FOR conname_text, tbl IN SELECT conname, conrelid::regclass::text AS tbl FROM pg_constraint WHERE convalidated = false AND contype = 'f' LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', tbl, conname_text);
      RAISE NOTICE 'Validated constraint % on table %', conname_text, tbl;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not validate constraint % on table %: %', conname_text, tbl, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Attempted to validate new tenantId_new FKs (some may remain NOT VALID)';

  -- ========================
  -- Final cleanup guidance (do not auto-drop in this migration):
  -- After verifying data integrity and validating constraints, run the following manual steps in order:
  -- 1) Drop old FK constraints that reference tenantId_old (look for *_tenantId_fkey)
  -- 2) Drop old indexes on tenantId_old
  -- 3) Drop tenantId_old columns
  -- 4) Rename tenantId_new -> tenantId
  -- 5) Recreate indexes and constraints with original names (if needed)
  -- The reason for not dropping here is to give operators a chance to test and validate before irreversible changes.

  RAISE NOTICE 'Migration finished: tenantId_new columns created and populated. Manual validation and cleanup recommended next.';
END$$;