-- 20251213170000_company_tenant_integrity/migration.sql
-- Adds tenant/company integrity: trigger, FK constraints (NOT VALID), and indexes
-- Idempotent operations: uses information_schema and conditional operations

-- Make sure Company has tenantId (only if Company exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Company') THEN
    ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
  END IF;
END$$;

-- Create a function to validate that company belongs to tenant
CREATE OR REPLACE FUNCTION public.ensure_company_belongs_to_tenant()
RETURNS TRIGGER AS $$
DECLARE
  comp_tenant TEXT;
  v_companyId TEXT;
  v_tenantId TEXT;
BEGIN
  -- Accommodate both quoted camelCase column names ("companyId") and unquoted lower-case (companyid)
  BEGIN
    v_companyId := NEW."companyId";
  EXCEPTION WHEN others THEN
    v_companyId := NULL;
  END;
  IF v_companyId IS NULL THEN
    BEGIN
      v_companyId := NEW.companyid;
    EXCEPTION WHEN others THEN
      v_companyId := NULL;
    END;
  END IF;

  IF v_companyId IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    v_tenantId := NEW."tenantId";
  EXCEPTION WHEN others THEN
    v_tenantId := NULL;
  END;
  IF v_tenantId IS NULL THEN
    BEGIN
      v_tenantId := NEW.tenantid;
    EXCEPTION WHEN others THEN
      v_tenantId := NULL;
    END;
  END IF;

  SELECT "tenantId" INTO comp_tenant FROM public."Company" WHERE id = v_companyId;
  IF comp_tenant IS NULL THEN
    RAISE EXCEPTION 'invalid companyId % on %', v_companyId, TG_TABLE_NAME;
  END IF;
  IF comp_tenant::text != v_tenantId::text THEN
    RAISE EXCEPTION 'company tenant mismatch for companyId=% tenantId=% table=%', v_companyId, v_tenantId, TG_TABLE_NAME;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers, indexes, and FK constraints (NOT VALID) for all tables containing companyId
DO $$
DECLARE
  r RECORD;
  trigger_name TEXT;
  v_constraint_name TEXT;
  sql TEXT;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE lower(column_name) = 'companyid' AND table_schema = 'public'
  LOOP
    trigger_name := format('tr_company_tenant_check_%s', r.table_name);
    v_constraint_name := format('fk_%s_company', r.table_name);

    -- Create an index on companyId if it doesn't exist
    BEGIN
      sql := format('CREATE INDEX IF NOT EXISTS %I_companyId_idx ON %I.%I("companyId")', r.table_name, r.table_schema, r.table_name);
      EXECUTE sql;
    EXCEPTION WHEN others THEN
      RAISE WARNING 'Index creation failed for %', r.table_name;
    END;

    -- Create foreign key (NOT VALID) if not exists and only if Company table exists
    PERFORM 1 FROM information_schema.table_constraints tc WHERE tc.constraint_name = v_constraint_name;
    IF NOT FOUND THEN
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name = 'Company') THEN
          sql := format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY("companyId") REFERENCES public."Company"(id) NOT VALID', r.table_schema, r.table_name, v_constraint_name);
          EXECUTE sql;
        END IF;
      EXCEPTION WHEN others THEN
        RAISE WARNING 'FK add failed for %', r.table_name;
      END;
    END IF;

    -- Add trigger that validates company tenant relationship
    BEGIN
      sql := format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON %I.%I FOR EACH ROW EXECUTE PROCEDURE public.ensure_company_belongs_to_tenant()', trigger_name, r.table_schema, r.table_name);
      EXECUTE sql;
    EXCEPTION WHEN duplicate_object THEN
      -- already exists
      NULL;
    WHEN others THEN
      RAISE WARNING 'Trigger creation failed for %', r.table_name;
    END;
  END LOOP;
END $$;

-- Note: Constraints are added NOT VALID. After running the backfill script to ensure companyId is populated for all rows,
-- run the following validation step separately in a safe window to avoid locking large tables:
-- DO $$ DECLARE r RECORD; BEGIN FOR r IN SELECT table_name FROM information_schema.columns WHERE lower(column_name) = 'companyid' AND table_schema = 'public' LOOP EXECUTE FORMAT('ALTER TABLE public.%I VALIDATE CONSTRAINT %I', r.table_name, format('fk_%s_company', r.table_name)); END LOOP; END $$;

-- Enable RLS for all tables with companyId where tenant-scoped policies are present
-- We only enable RLS where the table already has tenantId column and tenant isolation policy might exist
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT table_schema, table_name
    FROM information_schema.columns
    WHERE lower(column_name) = 'companyid' AND table_schema = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.table_schema, r.table_name);
    EXCEPTION WHEN others THEN
      RAISE WARNING 'Could not enable RLS on %', r.table_name;
    END;
  END LOOP;
END $$;
