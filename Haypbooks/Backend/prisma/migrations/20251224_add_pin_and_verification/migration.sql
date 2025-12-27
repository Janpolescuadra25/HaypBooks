-- Migration: 20251224_add_pin_and_verification
-- Add PIN support (pinHash, pinSetAt) to User, idempotent

DO $$
BEGIN
  -- Add pinHash text column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='pinHash') THEN
    ALTER TABLE public."User" ADD COLUMN "pinHash" TEXT;
  END IF;

  -- Add pinSetAt timestamp column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='pinSetAt') THEN
    ALTER TABLE public."User" ADD COLUMN "pinSetAt" timestamptz;
  END IF;
END$$;
