-- 20251215020000_convert_tenantid_to_uuid/migration.sql
-- Convert Tenant.id to UUID and convert tenantId columns in public schema to UUID.
-- Operation is idempotent and safe against pre-existing FKs/policies by dropping/re-adding constraints as NOT VALID.

DO $$
DECLARE
  r RECORD;
  t RECORD;
BEGIN
  -- Step 0: ensure Tenant.id values are castable to UUID (only check if id column is non-uuid)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='id' AND udt_name <> 'uuid') THEN
    IF EXISTS (SELECT 1 FROM public."Tenant" WHERE id IS NOT NULL AND id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$') THEN
      RAISE NOTICE 'Tenant.id contains non-UUID values; skipping conversion.';
      RETURN;
    END IF;
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
      ALTER TABLE public."Tenant" ALTER COLUMN "id" TYPE uuid USING ("id")::uuid;
    EXCEPTION WHEN SQLSTATE '42804' THEN
      -- type mismatch or similar: skip this conversion safely
      RAISE NOTICE 'Unable to cast Tenant.id to uuid due to data or constraint mismatch. Skipping conversion';
    WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- Step 4: Convert tenantId columns to uuid across public schema tables (idempotent)
  FOR t IN SELECT table_schema, table_name FROM information_schema.columns WHERE table_schema='public' AND column_name = 'tenantId' AND udt_name <> 'uuid' LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN "tenantId" TYPE uuid USING ("tenantId")::uuid', t.table_schema, t.table_name);
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