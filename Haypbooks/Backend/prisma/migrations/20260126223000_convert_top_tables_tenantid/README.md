Purpose
=======
This migration scaffolds a safe, incremental conversion of tenantId values (currently using older text-typed columns like tenantId_old) into UUID typed tenantId columns for the top blockers: WorkspaceUser (composite), Company, JournalEntry and JournalEntryLine.

Why this is staged and manual
=============================
Full automatic dropping of old FKs and tenantId_old columns can be risky in a large live DB with many dependencies (triggers, views, external constraints). This migration performs the safe, reversible parts:
- Add tenantId_new uuid columns and populate them from tenantId_old::uuid
- Add unique indices/constraints where needed (WorkspaceUser composite unique)
- Add new foreign-key constraints that reference the new columns using NOT VALID (to avoid long locks)
- Attempt a best-effort VALIDATE of those new FKs (some may remain NOT VALID and require manual intervention)

Manual checklist after running migration
=======================================
1) In staging, run the app tests and any queries that rely on tenantId to ensure nothing breaks.
2) Inspect the NOT VALID constraints:
   SELECT conname, conrelid::regclass::text AS table FROM pg_constraint WHERE convalidated = false AND contype = 'f';
3) For each NOT VALID FK, try validation:
   ALTER TABLE <table> VALIDATE CONSTRAINT <conname>;
   - If validation fails, inspect inconsistent rows using an anti-join or the failing FK definition.
4) After all new constraints are validated, run the final cleanup (one table at a time):
   - Drop dependent FK constraints that reference tenantId_old (take note of names in pg_constraint)
   - Drop indexes on tenantId_old (if any)
   - ALTER TABLE <table> DROP COLUMN tenantId_old;
   - ALTER TABLE <table> RENAME COLUMN tenantId_new TO tenantId;
   - Recreate original indexes/constraints using stable names where needed.

Notes & safety
===============
- This migration intentionally does NOT drop tenantId_old or original FKs automatically so you can validate first.
- Run the migration in a staging copy first and run queries that exercise cross-table constraints.
- If you want me to attempt the final cleanup steps automatically, I can scaffold those steps as a follow-up migration but I recommend manual validation in staging first.

Next recommended step
======================
- Run this migration on a staging copy, validate constraints, then run the cleanup steps listed above. After you confirm successful validation in staging I can prepare and run the cleanup migration in one controlled pass.

Commands
========
- Run migrations:
  npm --prefix "./" run migrate:run
- Validate NOT VALID constraints:
  -- Check which exist:
  SELECT conname, conrelid::regclass::text AS table FROM pg_constraint WHERE convalidated = false AND contype = 'f';
  -- Attempt to validate:
  ALTER TABLE public."Company" VALIDATE CONSTRAINT "Company_tenantId_fkey_new";

Contact
=======
If you'd like I can: 
- attempt the final cleanup automatically,
- or produce per-table SQL statements to run manually for safer control.

