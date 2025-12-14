-- Add tracking dimension columns to TenantUser (classId, locationId, projectId)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='TenantUser' AND column_name='classId') THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "classId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='TenantUser' AND column_name='locationId') THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "locationId" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='TenantUser' AND column_name='projectId') THEN
    ALTER TABLE public."TenantUser" ADD COLUMN "projectId" TEXT;
  END IF;

  -- indexes
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantuser_class_idx') THEN
    CREATE INDEX tenantuser_class_idx ON public."TenantUser"("classId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantuser_location_idx') THEN
    CREATE INDEX tenantuser_location_idx ON public."TenantUser"("locationId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tenantuser_project_idx') THEN
    CREATE INDEX tenantuser_project_idx ON public."TenantUser"("projectId");
  END IF;

  -- add foreign keys NOT VALID (validate after backfill if needed)
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_class') THEN
      ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tenantuser_class FOREIGN KEY ("classId") REFERENCES public."Class"(id) NOT VALID;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_location') THEN
      ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tenantuser_location FOREIGN KEY ("locationId") REFERENCES public."Location"(id) NOT VALID;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_tenantuser_project') THEN
      ALTER TABLE public."TenantUser" ADD CONSTRAINT fk_tenantuser_project FOREIGN KEY ("projectId") REFERENCES public."Project"(id) NOT VALID;
    END IF;
  EXCEPTION WHEN others THEN NULL; END;
END$$;
