-- Add name to Tenant table for client display name
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "name" TEXT;
