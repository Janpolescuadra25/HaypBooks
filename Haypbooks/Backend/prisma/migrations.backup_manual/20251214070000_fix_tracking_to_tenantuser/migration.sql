-- Ensure TenantUser tracking columns (classId, locationId, projectId) exist,
-- add indexes and foreign keys using safe idempotent DO blocks.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='TenantUser' AND column_name='classId'
  ) THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "classId" TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='TenantUser' AND column_name='locationId'
  ) THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "locationId" TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='TenantUser' AND column_name='projectId'
  ) THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "projectId" TEXT;
  END IF;
END$$;

-- Create indexes if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='tenantuser_class_idx'
  ) THEN
    CREATE INDEX tenantuser_class_idx ON public."TenantUser"("classId");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='tenantuser_location_idx'
  ) THEN
    CREATE INDEX tenantuser_location_idx ON public."TenantUser"("locationId");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='tenantuser_project_idx'
  ) THEN
    CREATE INDEX tenantuser_project_idx ON public."TenantUser"("projectId");
  END IF;
END$$;

-- Add foreign key constraints NOT VALID (idempotent, tolerate missing references)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_class'
  ) THEN
    BEGIN
      ALTER TABLE public."TenantUser"
        ADD CONSTRAINT fk_tenantuser_class FOREIGN KEY ("classId") REFERENCES public."Class"(id) NOT VALID;
    EXCEPTION WHEN OTHERS THEN
      -- allow failures if table/column missing
      NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_location'
  ) THEN
    BEGIN
      ALTER TABLE public."TenantUser"
        ADD CONSTRAINT fk_tenantuser_location FOREIGN KEY ("locationId") REFERENCES public."Location"(id) NOT VALID;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_project'
  ) THEN
    BEGIN
      ALTER TABLE public."TenantUser"
        ADD CONSTRAINT fk_tenantuser_project FOREIGN KEY ("projectId") REFERENCES public."Project"(id) NOT VALID;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
END$$;
