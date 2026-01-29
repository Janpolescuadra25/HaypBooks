## DB migrations & the Tenant table (short guide)

Summary
- The Prisma model `Workspace` is currently mapped to the physical table named `Tenant` via `@@map("Tenant")` in `prisma/schema.prisma`. This is intentional: it preserves compatibility while we migrated tenant-scoped data into the new `Company`/`Workspace` arrangements.

Why you see `Tenant` in the DB
- The physical table name in Postgres remains `Tenant` (legacy name). Prisma maps the model `Workspace` to that table so application code uses `Workspace` while the DB stays compatible.

If you prefer to rename the physical table to `Workspace` (optional)
1. Create a careful migration that:
   - Drops or marks as NOT VALID any FKs referencing `Tenant` (record them)
   - Runs `ALTER TABLE public."Tenant" RENAME TO "Workspace";
   - Recreate / revalidate FKs and RLS policies (cast to uuid where needed)
2. Test on a fresh DB in CI (the new GitHub Action added here), then run on staging with backups and maintenance window.

Recommendation
- Keep the mapping unless you have a strong reason to rename; renaming is possible but requires careful, staged SQL to avoid FK type mismatches and long validations.

If you'd like, I can open a PR doing either:
- Add CI (already added) + docs + final migration checklist, or
- Implement the physical rename migration and run it on staging (needs your go-ahead).
