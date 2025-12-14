-- Phase 4 migration: Onboarding table + user onboarding flag

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS onboardingcomplete BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS "OnboardingStep" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  step TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT fk_onboarding_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS onboarding_user_idx ON "OnboardingStep"("userId");
