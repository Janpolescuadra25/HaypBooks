-- Add DB-level CHECK constraint to enforce XOR ownership between companyId and practiceId
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_owner_xor' AND conrelid = 'public."Subscription"'::regclass) THEN
    ALTER TABLE public."Subscription" ADD CONSTRAINT subscription_owner_xor CHECK ( (("companyId" IS NOT NULL)::int + ("practiceId" IS NOT NULL)::int) = 1 );
  ELSE
    RAISE NOTICE 'Constraint subscription_owner_xor already exists on Subscription, skipping';
  END IF;
END;
$$;
