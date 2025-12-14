-- Add isActive column to Company if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='Company' AND column_name='isActive'
  ) THEN
    ALTER TABLE public."Company" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
  END IF;
END$$;
