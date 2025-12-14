-- Add closedAt and closedBy columns to AccountingPeriod if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='AccountingPeriod' AND column_name='closedAt'
  ) THEN
    ALTER TABLE public."AccountingPeriod" ADD COLUMN "closedAt" TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='AccountingPeriod' AND column_name='closedBy'
  ) THEN
    ALTER TABLE public."AccountingPeriod" ADD COLUMN "closedBy" TEXT;
  END IF;
END$$;
