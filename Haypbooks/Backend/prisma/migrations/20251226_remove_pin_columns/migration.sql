-- Remove pin columns from User safely
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='pinHash') THEN
    ALTER TABLE public."User" DROP COLUMN "pinHash";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name='pinSetAt') THEN
    ALTER TABLE public."User" DROP COLUMN "pinSetAt";
  END IF;
END$$;
