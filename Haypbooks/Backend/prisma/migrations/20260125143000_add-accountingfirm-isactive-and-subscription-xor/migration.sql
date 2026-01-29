-- Add isActive to AccountingFirm and add CHECK constraint for Subscription XOR ownership

ALTER TABLE public."AccountingFirm"
  ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true NOT NULL;

-- Add XOR constraint to Subscription to ensure exactly one of companyId/practiceId is set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscription_owner_xor'
  ) THEN
    ALTER TABLE public."Subscription"
    ADD CONSTRAINT subscription_owner_xor CHECK (
      (
        ("companyId" IS NOT NULL AND "practiceId" IS NULL)
        OR
        ("companyId" IS NULL AND "practiceId" IS NOT NULL)
      )
    );
  END IF;
END
$$;