-- Drop existing trigger and function
DROP TRIGGER IF EXISTS je_balance_check ON "JournalEntryLine";
DROP FUNCTION IF EXISTS check_je_balance() CASCADE;

-- Recreate function — cast COLUMN to UUID in WHERE clause, not the variable
CREATE OR REPLACE FUNCTION check_je_balance()
RETURNS TRIGGER AS $$
DECLARE
  je_id TEXT;
  total_debit NUMERIC;
  total_credit NUMERIC;
BEGIN
  -- Get journalId as TEXT (matches the actual column type)
  je_id := NEW."journalId";
  
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

-- Recreate trigger
CREATE TRIGGER je_balance_check
AFTER INSERT OR UPDATE ON "JournalEntryLine"
FOR EACH ROW
EXECUTE FUNCTION check_je_balance();

-- Verify
DO $$
DECLARE
  func_text TEXT;
BEGIN
  SELECT prosrc INTO func_text FROM pg_proc WHERE proname = 'check_je_balance';
  RAISE NOTICE 'Function source: %', func_text;
  
  IF func_text LIKE '%je_id TEXT%' THEN
    RAISE NOTICE 'SUCCESS: je_id is now TEXT type — matches column type';
  ELSE
    RAISE EXCEPTION 'FAILED: je_id is not TEXT';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'je_balance_check') THEN
    RAISE NOTICE 'SUCCESS: Trigger exists';
  ELSE
    RAISE EXCEPTION 'FAILED: Trigger missing';
  END IF;
END $$;
