-- Phase 8: Add onboarding_mode to User so frontend can distinguish quick vs full onboarding
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS onboarding_mode TEXT NOT NULL DEFAULT 'full';
