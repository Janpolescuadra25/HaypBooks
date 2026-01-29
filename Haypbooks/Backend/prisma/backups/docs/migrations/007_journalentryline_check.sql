-- Migration: Enforce JournalEntryLine debit/credit rules (XOR) via CHECK constraint
-- Run in Postgres during maintenance. Uses PL/pgSQL to avoid errors when constraint already exists.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'journalentryline_debit_credit_xor_check'
  ) THEN
    ALTER TABLE "JournalEntryLine"
    ADD CONSTRAINT journalentryline_debit_credit_xor_check
    CHECK (
      (debit >= 0 AND credit >= 0)
      AND (
        (debit > 0 AND credit = 0)
        OR (credit > 0 AND debit = 0)
      )
    );
  END IF;
END$$;

-- To rollback:
-- DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'journalentryline_debit_credit_xor_check') THEN ALTER TABLE "JournalEntryLine" DROP CONSTRAINT journalentryline_debit_credit_xor_check; END IF; END$$;
