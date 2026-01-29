ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "reviewedById" text;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "reviewedAt" timestamptz;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "reviewNotes" text;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "approvedById" text;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "approvedAt" timestamptz;
ALTER TABLE public."JournalEntry" ADD COLUMN IF NOT EXISTS "approvalNotes" text;

CREATE INDEX IF NOT EXISTS journalentry_reviewedBy_idx ON public."JournalEntry"("reviewedById");
CREATE INDEX IF NOT EXISTS journalentry_approvedBy_idx ON public."JournalEntry"("approvedById");

ALTER TABLE public."ReconciliationException" ADD COLUMN IF NOT EXISTS "subledgerReconciliationId" text;
CREATE INDEX IF NOT EXISTS reconexception_subledger_recon_idx ON public."ReconciliationException"("subledgerReconciliationId");
