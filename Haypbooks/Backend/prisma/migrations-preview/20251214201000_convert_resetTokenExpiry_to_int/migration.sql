-- Convert resettokenexpiry column to integer if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'resettokenexpiry' AND udt_name <> 'int4') THEN
    ALTER TABLE public."User" ALTER COLUMN "resettokenexpiry" TYPE integer USING "resettokenexpiry"::integer;
  END IF;
END$$;
