-- Idempotent migration to add composite index on JournalEntryLine
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'journalentryline_tenant_account_journal_idx') THEN
    CREATE INDEX journalentryline_tenant_account_journal_idx ON public."JournalEntryLine"("tenantId","accountId","journalId");
  END IF;
EXCEPTION WHEN others THEN
  -- ignore
END $$;
