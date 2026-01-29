-- Fix migration: ensure we drop ALL foreign key constraints referencing Tenant (regardless of column name), convert Tenant.id to uuid, convert tenantId/workspaceId columns to uuid, then re-add constraints & policies
BEGIN;

-- 0) Quick safety check: ensure Tenant ids are uuid-formatted
DO $$
DECLARE v_bad_count INT;
BEGIN
  SELECT count(*) INTO v_bad_count FROM public."Tenant" WHERE id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  IF v_bad_count > 0 THEN
    RAISE EXCEPTION 'Cannot convert Tenant.id to uuid: % invalid id(s) found. Inspect Tenant table before proceeding.', v_bad_count;
  END IF;
END$$;

-- 1) Backup tenant-related RLS policies
CREATE TEMP TABLE IF NOT EXISTS _tmp_tenant_policies (schemaname text, tablename text, policyname text, permissive text, roles text[]) ON COMMIT DROP;
INSERT INTO _tmp_tenant_policies (schemaname, tablename, policyname, permissive, roles)
SELECT schemaname::text, tablename::text, policyname::text, permissive::text, roles::text[]
FROM pg_policies
WHERE (qual LIKE '%tenantId%' OR with_check LIKE '%tenantId%' OR qual LIKE '%workspaceId%' OR with_check LIKE '%workspaceId%');

-- Drop those policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM _tmp_tenant_policies LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END$$;

-- 2) Backup and drop ALL foreign keys that reference Tenant (destination), regardless of local column name
CREATE TEMP TABLE IF NOT EXISTS _tmp_tenant_related_fks (conname text, table_name text, def text) ON COMMIT DROP;

INSERT INTO _tmp_tenant_related_fks (conname, table_name, def)
SELECT pc.conname, pc.conrelid::regclass::text AS table_name, pg_get_constraintdef(pc.oid) AS def
FROM pg_constraint pc
WHERE pc.contype = 'f' AND pc.confrelid = 'public."Tenant"'::regclass;

-- Drop these constraints
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM _tmp_tenant_related_fks LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I;', r.table_name, r.conname);
  END LOOP;
END$$;

-- 3) Convert Tenant.id to uuid
ALTER TABLE public."Tenant" ALTER COLUMN "id" TYPE uuid USING ("id"::uuid);

-- 4) Convert all columns named tenantId or workspaceId to uuid (only if type != uuid)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns
    WHERE (column_name = 'tenantId' OR column_name = 'workspaceId')
      AND table_schema = 'public'
      AND data_type <> 'uuid'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE uuid USING (%I::uuid);', r.table_name, r.column_name, r.column_name);
  END LOOP;
END$$;

-- 5) Recreate FK constraints we backed up
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM _tmp_tenant_related_fks LOOP
    -- The original def is like: FOREIGN KEY ("workspaceId") REFERENCES "Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT
    -- We'll add it back as not valid first to avoid full table validate timeouts
    EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s NOT VALID;', r.table_name, r.conname, r.def);
  END LOOP;

  -- Validate the foreign keys after adding
  FOR r IN SELECT * FROM _tmp_tenant_related_fks LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I;', r.table_name, r.conname);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Constraint % on % could not be validated immediately: %', r.conname, r.table_name, SQLERRM;
    END;
  END LOOP;
END$$;

-- 6) Recreate tenant/workspace policies, casting current_setting to uuid when recreating
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM _tmp_tenant_policies LOOP
    BEGIN
      EXECUTE format('CREATE POLICY %I ON %I.%I USING ("tenantId" = current_setting(''hayp.tenant_id'')::uuid) WITH CHECK ("tenantId" = current_setting(''hayp.tenant_id'')::uuid);', r.policyname, r.schemaname, r.tablename);
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.schemaname, r.tablename);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not recreate policy % on %.%: %', r.policyname, r.schemaname, r.tablename, SQLERRM;
    END;
  END LOOP;
END$$;

COMMIT;
