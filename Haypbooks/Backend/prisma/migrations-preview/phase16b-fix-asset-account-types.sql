-- phase16b-fix-asset-account-types.sql
-- Ensure FixedAsset assetAccountId and accumulatedDepreciationId are TEXT to match Account.id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='FixedAsset' AND column_name='assetAccountId') THEN
    ALTER TABLE public."FixedAsset" ALTER COLUMN "assetAccountId" TYPE text USING "assetAccountId"::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='FixedAsset' AND column_name='accumulatedDepreciationId') THEN
    ALTER TABLE public."FixedAsset" ALTER COLUMN "accumulatedDepreciationId" TYPE text USING "accumulatedDepreciationId"::text;
  END IF;
END $$;
