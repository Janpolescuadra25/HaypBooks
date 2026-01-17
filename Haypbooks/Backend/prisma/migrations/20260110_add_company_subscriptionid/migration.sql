-- Add subscriptionId column to Company table
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "subscriptionId" TEXT;

-- Backfill: Set subscriptionId on Company from existing Subscription records (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Subscription') THEN
    UPDATE "Company" c
    SET "subscriptionId" = (
      SELECT s.id
      FROM "Subscription" s
      WHERE s."companyId" = c.id
      LIMIT 1
    )
    WHERE EXISTS (
      SELECT 1 FROM "Subscription" s WHERE s."companyId" = c.id
    );
  END IF;
END $$;

-- Add unique constraint on subscriptionId
CREATE UNIQUE INDEX IF NOT EXISTS "Company_subscriptionId_key" ON "Company"("subscriptionId");

-- Add foreign key constraint (Company.subscriptionId -> Subscription.id) - only if Subscription table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Subscription') 
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Company_subscriptionId_fkey') THEN
    ALTER TABLE "Company" 
      ADD CONSTRAINT "Company_subscriptionId_fkey" 
      FOREIGN KEY ("subscriptionId") 
      REFERENCES "Subscription"("id") 
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
  END IF;
END $$;
