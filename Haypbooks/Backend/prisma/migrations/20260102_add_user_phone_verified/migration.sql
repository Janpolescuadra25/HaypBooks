-- Add columns to track verified phone state on users
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "isphoneverified" boolean NOT NULL DEFAULT false;
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "phoneverifiedat" timestamptz NULL;
