Backfill plan: Tenant.workspace_name

Purpose
- Add a new column `workspace_name` to `Tenant` and backfill it from the existing `name` column, to disambiguate Workspace name vs Company rows.

Steps (recommended, staging first)
1. Run dry-run of backfill script to see impacted rows:
   npm --prefix "Haypbooks/Backend" run db:backfill:workspace-name
   (This runs the script in dry-run mode by default.)

2. Inspect output and validate sample tenants. If everything looks correct, run apply:
   npm --prefix "Haypbooks/Backend" run db:backfill:workspace-name -- --apply

3. Verify no NULLs remain:
   SELECT COUNT(*) FROM public."Tenant" WHERE workspace_name IS NULL OR workspace_name = '';

4. If you want to enforce presence, set NOT NULL after verification (maintenance window):
   ALTER TABLE "Tenant" ALTER COLUMN workspace_name SET NOT NULL;

5. Update application code to read `workspace_name` instead of `name` where appropriate and deploy.
6. After full rollout and verification, consider removing or renaming the original `name` column.

Safety notes
- Backfill is idempotent. Always run on a staging copy first and have DB snapshots/backups available before schema changes.
- Do not set NOT NULL or drop old column until the app is live with the new column.
