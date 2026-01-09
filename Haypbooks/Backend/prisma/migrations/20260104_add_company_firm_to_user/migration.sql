-- 20260104_add_company_firm_to_user/migration.sql
-- Add companyName and firmName columns to User model

ALTER TABLE IF EXISTS public."User" ADD COLUMN IF NOT EXISTS "companyname" text;
ALTER TABLE IF EXISTS public."User" ADD COLUMN IF NOT EXISTS "firmname" text;

-- No additional constraints or indexes required at this time.
