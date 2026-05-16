-- Fix JE balance trigger function type mismatch
DROP TRIGGER IF EXISTS je_balance_check ON "JournalEntryLine";
DROP FUNCTION IF EXISTS check_je_balance();

CREATE OR REPLACE FUNCTION check_je_balance()
RETURNS TRIGGER AS $$
DECLARE
  je_id UUID;
  total_debit NUMERIC;
  total_credit NUMERIC;
BEGIN
  je_id := NEW."journalId";
  SELECT COALESCE(SUM("debit"), 0), COALESCE(SUM("credit"), 0)
  INTO total_debit, total_credit
  FROM "JournalEntryLine"
  WHERE "journalId" = je_id;

  IF ABS(total_debit - total_credit) > 0.01 THEN
    RAISE EXCEPTION 'Journal entry % is not balanced: debit=%, credit=%', je_id, total_debit, total_credit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER je_balance_check
AFTER INSERT OR UPDATE ON "JournalEntryLine"
FOR EACH ROW
EXECUTE FUNCTION check_je_balance();
