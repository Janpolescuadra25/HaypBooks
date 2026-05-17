-- Drop the trigger and function — incompatible with Prisma nested create
-- App-level balance validation in accounting.repository.ts handles this instead
DROP TRIGGER IF EXISTS je_balance_check ON "JournalEntryLine";
DROP FUNCTION IF EXISTS check_je_balance() CASCADE;

-- Verify removal
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'je_balance_check') THEN
    RAISE NOTICE 'SUCCESS: Trigger removed';
  ELSE
    RAISE EXCEPTION 'FAILED: Trigger still exists';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_je_balance') THEN
    RAISE NOTICE 'SUCCESS: Function removed';
  ELSE
    RAISE EXCEPTION 'FAILED: Function still exists';
  END IF;
END $$;
