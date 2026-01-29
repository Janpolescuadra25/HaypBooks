-- Migration: 001_document_sequence_and_constraints.sql
-- Purpose: Add an atomic next-number function for DocumentSequence, and enforce uniqueness on invoices per company.
-- NOTE: Review and run this in staging before production. Ensure "pgcrypto" extension is available for gen_random_uuid().

-- Create pgcrypto extension (no-op if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  END IF;
END;
$$;

-- Atomic next-number updater using the existing DocumentSequence table
CREATE OR REPLACE FUNCTION public.next_document_number(p_company uuid, p_document_type text)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  newnum bigint;
BEGIN
  LOOP
    -- Try an atomic increment on existing row
    UPDATE "DocumentSequence"
    SET "nextNumber" = "nextNumber" + 1
    WHERE "companyId" = p_company AND "documentType" = p_document_type
    RETURNING "nextNumber" INTO newnum;

    IF FOUND THEN
      RETURN newnum;
    END IF;

    -- If not found, try to insert the initial row. Concurrent inserts handled via exception
    BEGIN
      INSERT INTO "DocumentSequence" ("id","companyId","documentType","nextNumber","createdAt")
      VALUES (gen_random_uuid(), p_company, p_document_type, 1, now())
      RETURNING "nextNumber" INTO newnum;
      RETURN newnum;
    EXCEPTION WHEN unique_violation THEN
      -- Another transaction created it first; loop and try update again
    END;
  END LOOP;
END;
$$;

-- Safety check: ensure no duplicate invoice numbers exist per company before adding a UNIQUE constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM (
      SELECT "companyId", "invoiceNumber", count(*) cnt FROM "Invoice"
      WHERE "invoiceNumber" IS NOT NULL
      GROUP BY "companyId", "invoiceNumber" HAVING count(*) > 1
    ) t
  ) THEN
    RAISE EXCEPTION 'Duplicate invoice numbers found. Resolve duplicates before adding unique constraint.';
  END IF;
END;
$$;

-- Add unique constraint for invoice numbers per company (safe if the check above passes)
ALTER TABLE "Invoice"
ADD CONSTRAINT invoice_company_invoice_number_unique UNIQUE ("companyId", "invoiceNumber");

-- NOTE: Apply the check constraints prepared in docs/db_constraints.sql in the same migration batch (recommended).
-- You can include the file here or run it separately. For safety, review the checks in staging before running in prod.
-- Example (psql): \i 'docs/db_constraints.sql'

-- Example usage of next_document_number function (application should use this in a serializable transaction):
-- SELECT public.next_document_number('00000000-0000-0000-0000-000000000000'::uuid, 'INVOICE');

-- END 001
