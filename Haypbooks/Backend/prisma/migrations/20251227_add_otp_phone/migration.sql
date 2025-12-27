-- Add phone column to Otp for phone-based verifications and test helpers
ALTER TABLE public."Otp" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(32);
CREATE INDEX IF NOT EXISTS "Otp_phone_idx" ON public."Otp"("phone");