-- Attempt to VALIDATE any constraints added as NOT VALID that reference tenantId
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname as schema, c.relname as table, pc.conname
    FROM pg_constraint pc
    JOIN pg_class c ON pc.conrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE pc.convalidated = false
      AND pc.contype = 'f'
      AND EXISTS (
        SELECT 1
        FROM unnest(pc.conkey) WITH ORDINALITY AS ck(attnum, ord)
        JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum
        WHERE pa.attname = 'tenantId'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I VALIDATE CONSTRAINT %I', r.schema, r.table, r.conname);
      RAISE NOTICE 'Validated constraint % on table %.%', r.conname, r.schema, r.table;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not validate constraint % on table %.%: %', r.conname, r.schema, r.table, SQLERRM;
    END;
  END LOOP;
END
$$;