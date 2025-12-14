-- Convert tenant id and referencing tenantId columns to UUID (idempotent)
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Create extension if missing
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
    END IF;

    -- Convert Tenant.id if it exists as TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Tenant' AND column_name = 'id' AND (data_type = 'character varying' OR data_type = 'text')) THEN
        -- Add a new UUID column, populate via cast or gen_random_uuid
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Tenant' AND column_name = 'id_new') THEN
            ALTER TABLE "Tenant" ADD COLUMN "id_new" uuid;
            UPDATE "Tenant" SET "id_new" = CASE WHEN "id" ~ '^[0-9a-fA-F-]{36}$' THEN "id"::uuid ELSE gen_random_uuid() END;
            ALTER TABLE "Tenant" ALTER COLUMN "id_new" SET NOT NULL;
            -- swap PK
            ALTER TABLE "Tenant" DROP CONSTRAINT IF EXISTS "Tenant_pkey";
            ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id_new");
            -- rename columns
            ALTER TABLE "Tenant" RENAME COLUMN "id" TO "id_old";
            ALTER TABLE "Tenant" RENAME COLUMN "id_new" TO "id";
        END IF;
    END IF;

    -- Convert tenantId columns across tables
    FOR rec IN SELECT table_schema, table_name, column_name FROM information_schema.columns WHERE column_name = 'tenantId' AND data_type IN ('character varying', 'text') LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS tenantId_new uuid;', rec.table_schema, rec.table_name);
            EXECUTE format('UPDATE %I.%I SET tenantId_new = CASE WHEN tenantId ~ ''^[0-9a-fA-F-]{36}$'' THEN tenantId::uuid ELSE NULL END WHERE tenantId IS NOT NULL;', rec.table_schema, rec.table_name);
            EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN tenantId_new SET NOT NULL;', rec.table_schema, rec.table_name);
            -- Drop FK constraints referencing Tenant if needed will be rebuilt later, but we can attempt to drop/recreate
            -- Rename columns
            EXECUTE format('ALTER TABLE %I.%I DROP COLUMN IF EXISTS tenantId_old;', rec.table_schema, rec.table_name);
            EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN tenantId TO tenantId_old;', rec.table_schema, rec.table_name);
            EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN tenantId_new TO tenantId;', rec.table_schema, rec.table_name);
            -- Note: foreign keys should be recreated by later migrations as NOT VALID
        EXCEPTION WHEN others THEN
            RAISE WARNING 'Failed conversion for %.%', rec.table_schema, rec.table_name;
        END;
    END LOOP;
END $$;
