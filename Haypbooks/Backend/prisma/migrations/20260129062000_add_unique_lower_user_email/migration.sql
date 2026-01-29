-- Safe migration to add a unique index on lower(email) for User
DO $$
BEGIN
  -- Create a unique index on lower(email) if it doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relname = 'idx_user_lower_email') THEN
    BEGIN
      EXECUTE 'CREATE UNIQUE INDEX "idx_user_lower_email" ON public."User" (lower("email"))';
    EXCEPTION WHEN OTHERS THEN
      -- If index creation fails (e.g., due to duplicate values), log and continue; operator should address duplicates manually
      RAISE NOTICE 'Could not create idx_user_lower_email: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'idx_user_lower_email already exists, skipping';
  END IF;
END
$$;