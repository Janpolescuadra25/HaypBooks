-- Add companiesCreated counter to Tenant table
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "companiesCreated" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing counts based on current Company records (handle both text and uuid types)
DO $$
BEGIN
  UPDATE "Tenant" t
  SET "companiesCreated" = (
    SELECT COUNT(*) 
    FROM "Company" c 
    WHERE c."tenantId"::text = t.id::text
  )
  WHERE EXISTS (
    SELECT 1 FROM "Company" c WHERE c."tenantId"::text = t.id::text
  );
END $$;
