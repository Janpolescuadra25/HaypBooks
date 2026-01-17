ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "country" varchar(100);
ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "startDate" timestamptz;
ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "taxId" varchar(50);
ALTER TABLE public."Company" ADD COLUMN IF NOT EXISTS "legalName" varchar(200);
