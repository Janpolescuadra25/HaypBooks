-- Drop the Tenant_subscriptions foreign key index (if exists)
DROP INDEX IF EXISTS "Subscription_tenantId_idx";

-- Remove tenantId column from Subscription table (if table and column exist)
-- Subscriptions now belong only to Company, not Tenant
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Subscription') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='Subscription' AND column_name='tenantId') THEN
    ALTER TABLE "Subscription" DROP COLUMN "tenantId";
  END IF;
END $$;
