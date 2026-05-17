-- Step 1: Drop existing trigger and function completely
DROP TRIGGER IF EXISTS je_balance_check ON "JournalEntryLine";
DROP FUNCTION IF EXISTS check_je_balance() CASCADE;

-- Step 2: Verify they are gone
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'je_balance_check') THEN
    RAISE NOTICE 'WARNING: Trigger still exists!';
  ELSE
    RAISE NOTICE 'Trigger dropped successfully';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_je_balance') THEN
    RAISE NOTICE 'WARNING: Function still exists!';
  ELSE
    RAISE NOTICE 'Function dropped successfully';
  END IF;
END $$;

-- Step 3: Recreate function with EXPLICIT UUID casting
CREATE OR REPLACE FUNCTION check_je_balance()
RETURNS TRIGGER AS $$
DECLARE
  je_id UUID;
  total_debit NUMERIC;
  total_credit NUMERIC;
BEGIN
  je_id := NEW."journalId"::UUID;
  
  SELECT 
    COALESCE(SUM("debit"), 0)::NUMERIC,
    COALESCE(SUM("credit"), 0)::NUMERIC
  INTO total_debit, total_credit
  FROM "JournalEntryLine"
  WHERE "journalId" = je_id;
  
  IF total_debit != total_credit THEN
    RAISE EXCEPTION 'Journal entry lines must balance: debit = %, credit = %', total_debit, total_credit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate trigger
CREATE TRIGGER je_balance_check
AFTER INSERT OR UPDATE ON "JournalEntryLine"
FOR EACH ROW
EXECUTE FUNCTION check_je_balance();

-- Step 5: Verify the fix
DO $$
DECLARE
  func_text TEXT;
BEGIN
  SELECT prosrc INTO func_text FROM pg_proc WHERE proname = 'check_je_balance';
  
  IF func_text LIKE '%::UUID%' AND func_text LIKE '%je_id UUID%' THEN
    RAISE NOTICE 'SUCCESS: Function has correct UUID type and casting';
  ELSE
    RAISE EXCEPTION 'FAILED: Function does not have correct UUID type. Source: %', func_text;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'je_balance_check') THEN
    RAISE NOTICE 'SUCCESS: Trigger exists on JournalEntryLine';
  ELSE
    RAISE EXCEPTION 'FAILED: Trigger does not exist';
  END IF;
END $$;
