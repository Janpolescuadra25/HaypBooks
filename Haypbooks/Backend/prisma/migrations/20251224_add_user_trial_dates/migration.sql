-- Migration: 20251224_add_user_trial_dates
-- Reconstructed from existing DB schema (safe, idempotent)

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "trialStartedAt" timestamp,
  ADD COLUMN IF NOT EXISTS "trialEndsAt" timestamp;
