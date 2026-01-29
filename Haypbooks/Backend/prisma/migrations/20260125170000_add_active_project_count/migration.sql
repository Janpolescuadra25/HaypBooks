-- 20260125170000_add_active_project_count/migration.sql
-- Add denormalized active_project_count column to Tenant/Workspace
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Tenant' AND column_name='active_project_count') THEN
    ALTER TABLE "Tenant" ADD COLUMN "active_project_count" INTEGER NOT NULL DEFAULT 0;
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Add active_project_count failed: %', SQLERRM;
END$$;
