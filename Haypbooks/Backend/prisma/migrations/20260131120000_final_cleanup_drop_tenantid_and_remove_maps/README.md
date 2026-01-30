Final cleanup migration

Purpose:
- Drop legacy tenantId-like columns if it is safe to do so (no conflicting rows).
- Drop orphaned indexes that reference tenantId naming patterns.

Safety notes (READ BEFORE APPLYING):
- This migration is intended for staging; it is idempotent and will skip any table
  where there are conflicting tenantId values.
- Do NOT run this directly on production without a verified staging run and a
  backup.

Post-migration steps (manual):
1. In the repo, run `node scripts/cleanup/remove_final_tenant_maps.js` to remove
   leftover `@map("tenantId")` tokens from generated schema copies and docs.
2. Run `npx prisma generate` to regenerate Prisma Client.
3. Run full test suite / smoke tests and a staging deploy before promoting.

If any table is skipped due to conflicts, produce a report with
`SELECT * FROM <table> WHERE tenantId IS NOT NULL AND tenantId::text IS DISTINCT FROM COALESCE(workspaceid::text, workspaceId::text);` to inspect differences.
