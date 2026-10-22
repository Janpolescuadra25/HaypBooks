-- Drop the legacy global journal entry unique index so numbering can be enforced per company.
DROP INDEX IF EXISTS "JournalEntry_entryNumber_key";

-- Enforce unique journal entry numbering within each company.
CREATE UNIQUE INDEX "JournalEntry_companyId_entryNumber_key"
ON "JournalEntry"("companyId", "entryNumber");
