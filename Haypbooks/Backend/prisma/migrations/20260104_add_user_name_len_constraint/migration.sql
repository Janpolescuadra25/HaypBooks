-- Add check constraints to enforce max length for companyname and firmname (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_companyname_len') THEN
    ALTER TABLE public."User" ADD CONSTRAINT user_companyname_len CHECK (companyname IS NULL OR char_length(companyname) <= 140);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_firmname_len') THEN
    ALTER TABLE public."User" ADD CONSTRAINT user_firmname_len CHECK (firmname IS NULL OR char_length(firmname) <= 140);
  END IF;
END$$;
