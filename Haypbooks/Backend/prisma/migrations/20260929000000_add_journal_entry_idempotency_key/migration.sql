-- Add a dedicated idempotency key for repeated journal posting retries.
ALTER TABLE "JournalEntry"
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "JournalEntry_idempotencyKey_key"
  ON "JournalEntry"("idempotencyKey");

CREATE INDEX IF NOT EXISTS "JournalEntry_idempotencyKey_idx"
  ON "JournalEntry"("idempotencyKey");
