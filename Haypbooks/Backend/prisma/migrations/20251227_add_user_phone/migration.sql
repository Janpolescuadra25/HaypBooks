-- Add phone column to users for contact/verification
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "phone" TEXT;