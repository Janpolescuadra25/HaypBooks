-- Remove trial tracking fields from User table (now managed at Tenant level)
ALTER TABLE "User" DROP COLUMN IF EXISTS "trialStartedAt";
ALTER TABLE "User" DROP COLUMN IF EXISTS "trialEndsAt";
