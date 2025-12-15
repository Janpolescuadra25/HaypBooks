-- Migration: 20251216100000_accountant_access_and_perks
-- 1) introduce AccountantAccessLevel enum and convert accessLevel
-- 2) add foreign key for invitedBy to User
-- 3) add ProAdvisorPerk table

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccountantAccessLevel') THEN
    CREATE TYPE "AccountantAccessLevel" AS ENUM ('FULL','VIEW_ONLY','BILLING_ONLY');
  END IF;
END$$;

-- convert existing accessLevel text to enum safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='AccountantClient' AND column_name='accessLevel' AND data_type='text') THEN
    ALTER TABLE public."AccountantClient" ALTER COLUMN "accessLevel" TYPE "AccountantAccessLevel" USING (
      CASE WHEN "accessLevel" = 'FULL' THEN 'FULL'::"AccountantAccessLevel"
           WHEN "accessLevel" = 'VIEW_ONLY' THEN 'VIEW_ONLY'::"AccountantAccessLevel"
           WHEN "accessLevel" = 'BILLING_ONLY' THEN 'BILLING_ONLY'::"AccountantAccessLevel"
           ELSE 'FULL'::"AccountantAccessLevel" END
    );
  END IF;
END$$;

-- Add FK for invitedBy referencing User
ALTER TABLE public."AccountantClient"
  ADD CONSTRAINT IF NOT EXISTS "AccountantClient_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES public."User"(id) ON DELETE SET NULL;

-- Create ProAdvisorPerk table
CREATE TABLE IF NOT EXISTS public."ProAdvisorPerk" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text NOT NULL,
  "type" text NOT NULL,
  "name" text NOT NULL,
  "issuer" text,
  "awardedAt" timestamptz NOT NULL DEFAULT now(),
  "metadata" jsonb
);

ALTER TABLE public."ProAdvisorPerk" ADD CONSTRAINT IF NOT EXISTS "ProAdvisorPerk_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS "ProAdvisorPerk_userId_idx" ON public."ProAdvisorPerk" ("userId");

-- Note: enum type for perk is represented as text here; if desired, add a Postgres enum for PerkType similarly.
