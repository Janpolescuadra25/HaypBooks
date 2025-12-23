-- Idempotent migration to add isAccountant to User
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='isAccountant') THEN
    ALTER TABLE public."User" ADD COLUMN "isAccountant" boolean DEFAULT false;
  END IF;
EXCEPTION WHEN duplicate_column THEN
  -- already exists
END $$;

-- Add an index if needed (not strictly necessary for boolean but useful for queries)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'User_isAccountant_idx') THEN
    CREATE INDEX "User_isAccountant_idx" ON public."User" ("isAccountant");
  END IF;
END $$;
