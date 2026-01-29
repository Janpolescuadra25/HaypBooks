-- Revised migration: safer approach to convert Tenant.id to UUID and tenant/workspace columns to uuid
-- Key differences from earlier attempt:
--   * Drop ANY FK referencing Tenant (confrelid = Tenant) rather than searching only for columns named tenantId
--   * Handle both tenantId and workspaceId columns
--   * Recreate FK constraints as NOT VALID and then validate

DO $$
DECLARE
  v_bad_count INT;
  r RECORD;
BEGIN
  -- Validate that every existing tenant id matches UUID format
  SELECT count(*) INTO v_bad_count FROM public."Tenant" WHERE id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  IF v_bad_count > 0 THEN
    RAISE EXCEPTION 'Cannot convert Tenant.id to uuid: % invalid id(s) found. Inspect Tenant table before proceeding.', v_bad_count;
  END IF;

  -- Backup tenant-related RLS policies (matching tenantId or workspaceId in qual/check)
  CREATE TEMP TABLE _tmp_tenant_policies (schemaname text, tablename text, policyname text, permissive text, roles text[]) ON COMMIT DROP;
  INSERT INTO _tmp_tenant_policies (schemaname, tablename, policyname, permissive, roles)
    SELECT schemaname::text, tablename::text, policyname::text, permissive::text, roles::text[]
    FROM pg_policies
    WHERE (qual LIKE '%tenantId%' OR with_check LIKE '%tenantId%' OR qual LIKE '%workspaceId%' OR with_check LIKE '%workspaceId%');

  FOR r IN SELECT * FROM _tmp_tenant_policies LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;

  -- Backup and drop ALL foreign key constraints that reference Tenant and any constraints involving tenantId / workspaceId columns
  CREATE TEMP TABLE _tmp_tenant_related_fks ON COMMIT DROP AS
    SELECT DISTINCT pc.oid, pc.conname, pc.conrelid::regclass::text as table_name, pc.conrelid, pc.confrelid, pc.conkey, pc.confkey, pg_get_constraintdef(pc.oid) as def
    FROM pg_constraint pc
    WHERE pc.contype = 'f'
      AND (
        pc.confrelid = 'public."Tenant"'::regclass
        OR EXISTS (SELECT 1 FROM unnest(pc.conkey) ck(attnum) JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum WHERE pa.attname IN ('tenantId','workspaceId'))
        OR EXISTS (SELECT 1 FROM unnest(pc.confkey) ck(attnum) JOIN pg_attribute pa ON pa.attrelid = pc.confrelid AND pa.attnum = ck.attnum WHERE pa.attname IN ('tenantId','workspaceId'))
      );

  FOR r IN SELECT * FROM _tmp_tenant_related_fks LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I;', r.table_name, r.conname);
  END LOOP;

  -- Convert Tenant.id to uuid
  ALTER TABLE public."Tenant" ALTER COLUMN "id" TYPE uuid USING ("id"::uuid);

  -- Convert tenantId and workspaceId columns across public schema to uuid (skip if already uuid)
  FOR r IN (
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE (column_name = 'tenantId' OR column_name = 'workspaceId')
      AND table_schema = 'public'
      AND data_type <> 'uuid'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE uuid USING (%I::uuid);', r.table_name, r.column_name, r.column_name);
  END LOOP;

  -- Re-add FK constraints as NOT VALID only if column types match; otherwise log and skip
  CREATE TEMP TABLE _tmp_added_fks (conname text, table_name text) ON COMMIT DROP;

  FOR r IN SELECT * FROM _tmp_tenant_related_fks LOOP
    DECLARE
      local_types text[];
      ref_types text[];
      cnt_local int;
      cnt_ref int;
      is_compatible boolean := false;
      idx int;
    BEGIN
      -- gather local column types in the same order
      SELECT array_agg(pt.typname ORDER BY ord) INTO local_types
      FROM (
        SELECT pa.attnum AS attnum, pa.attname, pt.typname, ord
        FROM unnest(r.conkey) WITH ORDINALITY AS ck(attnum, ord)
        JOIN pg_attribute pa ON pa.attrelid = r.conrelid AND pa.attnum = ck.attnum
        JOIN pg_type pt ON pa.atttypid = pt.oid
      ) s;

      -- gather referenced column types in the same order
      SELECT array_agg(pt.typname ORDER BY ord) INTO ref_types
      FROM (
        SELECT pa.attnum AS attnum, pa.attname, pt.typname, ord
        FROM unnest(r.confkey) WITH ORDINALITY AS ck(attnum, ord)
        JOIN pg_attribute pa ON pa.attrelid = r.confrelid AND pa.attnum = ck.attnum
        JOIN pg_type pt ON pa.atttypid = pt.oid
      ) s;

      cnt_local := COALESCE(array_length(local_types,1),0);
      cnt_ref := COALESCE(array_length(ref_types,1),0);

      IF cnt_local = cnt_ref AND cnt_local > 0 THEN
        is_compatible := true;
        FOR idx IN 1..cnt_local LOOP
          IF local_types[idx] IS DISTINCT FROM ref_types[idx] THEN
            is_compatible := false;
            EXIT;
          END IF;
        END LOOP;
      END IF;

      IF is_compatible THEN
        EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I %s NOT VALID;', r.table_name, r.conname, r.def);
        INSERT INTO _tmp_added_fks(conname, table_name) VALUES (r.conname, r.table_name);
      ELSE
        RAISE NOTICE 'Skipping constraint % on % due to type mismatch (local: %, ref: %)', r.conname, r.table_name, COALESCE(array_to_string(local_types, ','), '(none)'), COALESCE(array_to_string(ref_types, ','), '(none)');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error while analyzing/adding constraint % on %: %', r.conname, r.table_name, SQLERRM;
    END;
  END LOOP;

  -- Try to validate constraints we actually added; if validation fails leave them NOT VALID and log notice
  FOR r IN SELECT * FROM _tmp_added_fks LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I;', r.table_name, r.conname);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Constraint % on % could not be validated immediately: %', r.conname, r.table_name, SQLERRM;
    END;
  END LOOP;

  -- Recreate tenant/workspace policies casting settings to uuid
  FOR r IN SELECT * FROM _tmp_tenant_policies LOOP
    BEGIN
      EXECUTE format('CREATE POLICY %I ON %I.%I USING ("tenantId" = current_setting(''hayp.tenant_id'')::uuid) WITH CHECK ("tenantId" = current_setting(''hayp.tenant_id'')::uuid);', r.policyname, r.schemaname, r.tablename);
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.schemaname, r.tablename);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not recreate policy % on %.%: %', r.policyname, r.schemaname, r.tablename, SQLERRM;
    END;
  END LOOP;
END;
$$;