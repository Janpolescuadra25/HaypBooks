-- Add phone_hmac column for privacy-safe phone lookup
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone_hmac" TEXT;
CREATE INDEX IF NOT EXISTS "User_phone_hmac_idx" ON "User" ("phone_hmac");
