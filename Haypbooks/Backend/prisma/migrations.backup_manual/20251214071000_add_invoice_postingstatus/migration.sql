-- Add postingStatus column to Invoice if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Invoice' AND column_name='postingStatus'
  ) THEN
    ALTER TABLE public."Invoice" ADD COLUMN "postingStatus" TEXT NOT NULL DEFAULT 'DRAFT';
  END IF;
END$$;
