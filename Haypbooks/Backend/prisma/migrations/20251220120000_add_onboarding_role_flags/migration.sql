-- Idempotent migration to add per-hub onboarding flags to users
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "owneronboardingcomplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountantonboardingcomplete" BOOLEAN NOT NULL DEFAULT false;

-- This migration is safe to re-run (uses IF NOT EXISTS) so CI/test scripts can reapply without failing.
