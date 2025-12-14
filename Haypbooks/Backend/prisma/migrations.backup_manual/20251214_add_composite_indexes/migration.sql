-- Add composite indexes for high-volume patterns (idempotent)
DO $$
BEGIN
  -- JournalEntryLine (tenantId, accountId)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'journalentryline_tenantid_accountid_idx') THEN
    CREATE INDEX journalentryline_tenantid_accountid_idx ON public."JournalEntryLine" ("tenantId", "accountId");
  END IF;

  -- InvoiceLine (tenantId, itemId)
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'invoiceline_tenantid_itemid_idx') THEN
    CREATE INDEX invoiceline_tenantid_itemid_idx ON public."InvoiceLine" ("tenantId", "itemId");
  END IF;
END$$;
