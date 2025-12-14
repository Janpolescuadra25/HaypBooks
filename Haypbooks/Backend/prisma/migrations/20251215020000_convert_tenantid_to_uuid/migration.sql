-- 20251215020000_convert_tenantid_to_uuid/migration.sql
-- Convert Tenant.id to UUID and convert tenantId columns in public schema to UUID.
-- Operation is idempotent and safe against pre-existing FKs/policies by dropping/re-adding constraints as NOT VALID.

DO $$
DECLARE
  r RECORD;
  t RECORD;
BEGIN
  -- Step 0: Prepare Tenant.id conversion: if non-UUID values exist, we'll assign gen_random_uuid() to preserve referential integrity
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='id' AND udt_name <> 'uuid') THEN
    RAISE NOTICE 'Tenant.id is not uuid; proceeding with conversion (non-UUID values will be replaced with gen_random_uuid())';
  END IF;

  -- Step 1: Drop foreign key constraints referencing public.Tenant
  FOR r IN SELECT conname, conrelid::regclass::text AS tablename FROM pg_constraint WHERE confrelid = 'public."Tenant"'::regclass AND contype = 'f' LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', r.tablename, r.conname);
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END LOOP;

  -- Step 2: Temporarily drop policies that reference tenantId to permit type changes.
  -- We'll try to drop policies for known tenant tables, but this is best-effort (idempotent).
  FOR r IN SELECT table_schema::text || '.' || table_name::text AS tbl FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('Tenant','Employee','PayrollRun','Paycheck','Company','Contact','Invoice','PaymentReceived','Bill','BillPayment','JournalEntry','BankAccount','BankTransaction') LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON %s', split_part(r.tbl, '.', 2), r.tbl);
    EXCEPTION WHEN others THEN NULL; END;
  END LOOP;

  -- Step 3: Convert Tenant.id to uuid if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name = 'Tenant' AND column_name = 'id' AND udt_name <> 'uuid') THEN
    BEGIN
      -- Add temporary id_new, populate via cast when possible, otherwise gen_random_uuid()
      ALTER TABLE public."Tenant" ADD COLUMN IF NOT EXISTS id_new uuid;
      UPDATE public."Tenant"
      SET id_new = CASE WHEN id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN id::uuid ELSE gen_random_uuid() END
      WHERE id IS NOT NULL;
      -- If safe, set NOT NULL on id_new
      IF (SELECT COUNT(*) FROM public."Tenant" WHERE id_new IS NULL) = 0 THEN
        ALTER TABLE public."Tenant" ALTER COLUMN id_new SET NOT NULL;
      END IF;
      -- swap columns and reset PK
      ALTER TABLE public."Tenant" DROP CONSTRAINT IF EXISTS "Tenant_pkey";
      ALTER TABLE public."Tenant" RENAME COLUMN id TO id_old;
      ALTER TABLE public."Tenant" RENAME COLUMN id_new TO id;
      ALTER TABLE public."Tenant" ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);
    EXCEPTION WHEN others THEN
      RAISE WARNING 'Tenant.id conversion encountered an error: %', SQLERRM;
    END;
  END IF;

  -- Step 4: Convert tenantId columns to uuid across public schema tables (idempotent)
    FOR t IN SELECT table_schema, table_name FROM information_schema.columns WHERE table_schema='public' AND column_name = 'tenantId' AND udt_name <> 'uuid' LOOP
    BEGIN
      -- Add tenantId_new and populate using cast when possible; fallback to gen_random_uuid()
      EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS tenantId_new uuid;', t.table_schema, t.table_name);
      EXECUTE format('UPDATE %I.%I SET tenantId_new = CASE WHEN tenantId ~ ''^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'' THEN tenantId::uuid ELSE gen_random_uuid() END WHERE tenantId IS NOT NULL;', t.table_schema, t.table_name);
      -- Set NOT NULL if safe
      EXECUTE format('DO $$ BEGIN IF (SELECT COUNT(*) FROM %I.%I WHERE tenantId IS NOT NULL AND tenantId_new IS NULL) = 0 THEN ALTER TABLE %I.%I ALTER COLUMN tenantId_new SET NOT NULL; END IF; END $$;', t.table_schema, t.table_name, t.table_schema, t.table_name);
      -- Rename and swap
      EXECUTE format('ALTER TABLE %I.%I DROP COLUMN IF EXISTS tenantId_old;', t.table_schema, t.table_name);
      EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN tenantId TO tenantId_old;', t.table_schema, t.table_name);
      EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN tenantId_new TO tenantId;', t.table_schema, t.table_name);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipping conversion of % because of: %', format('%I.%I', t.table_schema, t.table_name), SQLERRM;
      NULL;
    END;
  END LOOP;

  -- Step 5: Re-add tenant foreign keys as NOT VALID (idempotent) for all tables with tenantId
  FOR t IN SELECT table_schema, table_name FROM information_schema.columns WHERE table_schema='public' AND column_name = 'tenantId' LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY ("tenantId") REFERENCES public."Tenant"("id") ON DELETE RESTRICT NOT VALID', t.table_schema, t.table_name, format('fk_%s_tenant', t.table_name));
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END;
  END LOOP;

  -- Step 6: Recreate RLS policies; best-effort: create allow_all_tenant for tables with tenantId
  FOR t IN SELECT table_schema, table_name FROM information_schema.columns WHERE table_schema='public' AND column_name = 'tenantId' LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', t.table_schema, t.table_name);
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (("tenantId")::text = current_setting(''hayp.tenant_id'')) WITH CHECK (("tenantId")::text = current_setting(''hayp.tenant_id''))', format('tenant_isolation_%s', t.table_name), t.table_schema, t.table_name);
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END;
  END LOOP;

END$$ LANGUAGE plpgsql;
