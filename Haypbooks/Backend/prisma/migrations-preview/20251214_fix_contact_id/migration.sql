-- Migration: 20251214_fix_contact_id
-- Reintroduce UUID default for Contact.id and ensure ContactEmail/ContactPhone relation consistency

-- Ensure pgcrypto extension for gen_random_uuid exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set default to generate UUIDs using gen_random_uuid()
ALTER TABLE "Contact" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Ensure contactId columns reference Contact.id and are indexed (if not already)
-- This will not change the column type; if necessary use `ALTER TABLE ... ALTER COLUMN ... TYPE text` if explicit types exist.

-- Add indices to speed up FK lookups (no-op if they exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'contactemail_contactid_idx'
  ) THEN
    CREATE INDEX contactemail_contactid_idx ON "ContactEmail"("contactId");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'contactphone_contactid_idx'
  ) THEN
    CREATE INDEX contactphone_contactid_idx ON "ContactPhone"("contactId");
  END IF;
END$$;

-- If there are existing constraints referencing Contact.id as non-matching types, ensure FK constraints exist and are valid.
-- If necessary, add or re-create FKs using NOT VALID to avoid long-running validations, then run VALIDATE CONSTRAINT after backfill/verification.

-- Example add (commented):
-- ALTER TABLE "ContactEmail" ADD CONSTRAINT fk_contactemail_contact FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") NOT VALID;
-- ALTER TABLE "ContactPhone" ADD CONSTRAINT fk_contactphone_contact FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") NOT VALID;

-- NOTE: Run validate after confirming no orphaned rows and after backfill if needed:
-- ALTER TABLE "ContactEmail" VALIDATE CONSTRAINT fk_contactemail_contact;
-- ALTER TABLE "ContactPhone" VALIDATE CONSTRAINT fk_contactphone_contact;

-- Done.
