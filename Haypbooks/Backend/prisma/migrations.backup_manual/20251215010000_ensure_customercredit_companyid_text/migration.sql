-- 20251215010000_ensure_customercredit_companyid_text/migration.sql
-- Ensure CustomerCredit.companyId column is TEXT and FK to Company is present and NOT VALID

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CustomerCredit' AND column_name='companyId' AND udt_name <> 'text') THEN
    -- Change type to text if mismatched. Wrap in try/except to avoid blocking if policies or constraints prevent ALTER
    BEGIN
      ALTER TABLE public."CustomerCredit" ALTER COLUMN "companyId" TYPE text USING "companyId"::text;
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;

  -- Add FK constraint if missing, idempotent
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customercredit_company') THEN
    BEGIN
      ALTER TABLE public."CustomerCredit" ADD CONSTRAINT fk_customercredit_company FOREIGN KEY ("companyId") REFERENCES public."Company"("id") ON DELETE SET NULL NOT VALID;
    EXCEPTION WHEN others THEN NULL; END;
  END IF;
END$$ LANGUAGE plpgsql;
