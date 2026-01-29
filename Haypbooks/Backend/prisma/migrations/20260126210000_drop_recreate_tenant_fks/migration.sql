-- Drop FK constraints referencing Tenant.id, convert Tenant.id to uuid, convert tenantId columns to uuid where needed, and recreate FKs
DO $$
DECLARE
  r RECORD;
  v_cnt INT;
BEGIN
  -- Ensure Tenant ids look like UUIDs
  SELECT count(*) INTO v_cnt FROM public."Tenant" WHERE id::text !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  IF v_cnt > 0 THEN
    RAISE EXCEPTION 'Aborting: % Tenant.id values are not UUIDs; fix before running this migration', v_cnt;
  END IF;

  -- Drop foreign keys referencing Tenant.id
  RAISE NOTICE 'Dropping foreign keys referencing Tenant.id (if any)';
  FOR r IN
    SELECT n.nspname AS schema, c.relname AS table, pc.conname
    FROM pg_constraint pc
    JOIN pg_class c ON pc.conrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pc.contype = 'f'
      AND pc.confrelid = (SELECT oid FROM pg_class WHERE relname = 'Tenant' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.schema, r.table, r.conname);
      RAISE NOTICE 'Dropped constraint % on %.%', r.conname, r.schema, r.table;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to drop constraint % on %.%: %', r.conname, r.schema, r.table, SQLERRM;
    END;
  END LOOP;

  -- Convert Tenant.id to uuid
  RAISE NOTICE 'Converting Tenant.id -> uuid';
  ALTER TABLE public."Tenant" ALTER COLUMN "id" TYPE uuid USING ("id"::uuid);

  -- Convert tenantId columns to uuid where they are text
  RAISE NOTICE 'Converting tenantId columns on tables to uuid where necessary';
  FOR r IN
    SELECT table_schema AS schema, table_name AS table, column_name
    FROM information_schema.columns
    WHERE column_name = 'tenantId' AND data_type = 'text'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN "tenantId" TYPE uuid USING ("tenantId"::uuid)', r.schema, r.table);
      RAISE NOTICE 'Converted %.% tenantId to uuid', r.schema, r.table;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not convert tenantId on %.%: %', r.schema, r.table, SQLERRM;
    END;
  END LOOP;

  -- Recreate foreign keys for tables that have tenantId but no constraint
  RAISE NOTICE 'Recreating tenantId foreign keys where missing';
  FOR r IN
    SELECT ns.nspname AS schema, c.relname AS table
    FROM pg_class c
    JOIN pg_namespace ns ON c.relnamespace = ns.oid
    WHERE EXISTS (
      SELECT 1 FROM information_schema.columns ic WHERE ic.table_schema = ns.nspname AND ic.table_name = c.relname AND ic.column_name = 'tenantId'
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_constraint pc WHERE pc.conrelid = c.oid AND pc.contype = 'f' AND EXISTS (
        SELECT 1 FROM unnest(pc.conkey) ck(attnum) JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum WHERE pa.attname = 'tenantId'
      )
    )
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE', r.schema, r.table, (r.table || '_tenantId_fkey'));
      RAISE NOTICE 'Created tenant FK on %.% -> Tenant', r.schema, r.table;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to create tenant FK on %.%: %', r.schema, r.table, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Tenant FK reconciliation completed';
END;
$$;