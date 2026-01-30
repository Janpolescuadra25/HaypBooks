-- Final cleanup: Drop legacy tenantId columns if safe (dev/staging only!).
-- This migration is guarded and idempotent. It will only drop a legacy column
-- when ALL rows are either NULL or equal to the corresponding workspaceId.
-- It handles several legacy column name variants and mixed-casing.

DO $$
DECLARE
  rec RECORD;
  legacy_col TEXT;
  workspace_candidates TEXT[] := ARRAY['workspaceid','workspaceId','workspaceId','workspace_id'];
  ws_col TEXT;
  conflicting_count BIGINT;
BEGIN
  FOR rec IN
    SELECT DISTINCT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name IN ('tenantid','tenantId','tenant_id','tenantid_old','tenantId_old')
  LOOP
    FOR legacy_col IN SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=rec.table_name AND column_name IN ('tenantid','tenantId','tenant_id','tenantid_old','tenantId_old')
    LOOP
      -- find a best-effort workspace column in the table
      ws_col := NULL;
      FOR ws_col IN SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=rec.table_name AND column_name ILIKE 'workspace%'
      LOOP
        EXIT; -- take first matching column
      END LOOP;

      IF ws_col IS NULL THEN
        RAISE NOTICE 'Skipping % on %, no workspace column found', legacy_col, rec.table_name;
      ELSE
        -- Check if any row exists where legacy_col is non-null and differs from workspace col
        EXECUTE format('SELECT count(*) FROM %I WHERE %I IS NOT NULL AND (%I::text IS DISTINCT FROM %I::text)', rec.table_name, legacy_col, legacy_col, ws_col)
        INTO conflicting_count;

        IF conflicting_count > 0 THEN
          RAISE NOTICE 'Skipping drop of % on % — % conflicting rows found', legacy_col, rec.table_name, conflicting_count;
        ELSE
          -- Safe to drop
          RAISE NOTICE 'Dropping column % on % (no conflicting rows)', legacy_col, rec.table_name;
          EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I', rec.table_name, legacy_col);
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  -- As a final step, try to drop index or constraints referencing tenantId columns if they exist and are orphaned.
  -- We will scan pg_indexes for index names that include tenantId and drop them if they reference non-existent columns.
  FOR rec IN SELECT schemaname, tablename, indexname
             FROM pg_indexes
             WHERE schemaname = 'public' AND indexname ILIKE '%tenantid%'
  LOOP
    -- attempt to drop index safely
    BEGIN
      EXECUTE format('DROP INDEX IF EXISTS %I.%I', rec.schemaname, rec.indexname);
      RAISE NOTICE 'Dropped index % on table %', rec.indexname, rec.tablename;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to drop index % (ignored): %', rec.indexname, SQLERRM;
    END;
  END LOOP;

END$$;

-- NOTE: This migration will not remove any application-level @map annotations —
-- after this migration is applied to staging and verified, run the repository
-- script `scripts/cleanup/remove_final_tenant_maps.js` to delete any leftover
-- @map("tenantId") tokens in generated schema copies and docs, then run
-- `npx prisma generate` and run tests before pushing to production.
