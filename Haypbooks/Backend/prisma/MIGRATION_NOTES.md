Migration Note: add_task_archived_attachment_ispublic

Date: 2025-12-14

Overview:
The migration `20251214143409_add_task_archived_attachment_ispublic` was generated, but some operations could not be applied cleanly to the shadow database in our environment due to schema differences.

Action taken:
- The necessary DDL changes were applied idempotently using `scripts/db/add-attachment-task-columns.ts` which:
  - Adds `isPublic` BOOLEAN DEFAULT FALSE to `Attachment` (if not present)
  - Adds `archivedAt` TIMESTAMP to `Task` (if not present)
  - Creates indexes: `Attachment_isPublic_idx` and `Task_tenant_archivedAt_idx`

- The generated migration was then marked as applied with `npx prisma migrate resolve --applied 20251214143409_add_task_archived_attachment_ispublic`.

Why:
- Applying manual DDL allowed us to perform the minimal changes without reshaping large parts of the schema that could risk the shadow DB migration.

Reproducible steps for environments without direct DB access:
1. Ensure the repository contains `scripts/db/add-attachment-task-columns.ts` (idempotent). Run:

```bash
npx ts-node scripts/db/add-attachment-task-columns.ts
```

Alternatively, run the convenience runner which will execute all known idempotent DDL scripts:

```bash
node scripts/db/run-idempotent-ddl.js
```

2. Confirm the migration is recorded in Prisma's migration table. If necessary, mark as applied:

```bash
npx prisma migrate resolve --applied 20251214143409_add_task_archived_attachment_ispublic
```

3. Run `npx prisma generate` to update the client.

Notes:
- This approach is safe and idempotent; the script checks for column existence before adding them.
- The CI workflow `db-validation.yml` runs this script as part of validation for PRs and pushes to `main`.

RLS Guidance:
- For any migration that adds a tenant-scoped column (`tenantId` or `tenantId_txt`), **also** add:
  - `ENABLE ROW LEVEL SECURITY` for the table in the same migration (or a follow-up migration)
  - A `CREATE POLICY` that restricts access to rows matching the current tenant context, and a `WITH CHECK` that ensures rows are created with the current tenant id.
  - An index on (`tenantId`) and an explicit FK to `Tenant(id)`.
- Use the migration RLS lint (`scripts/ci/migration-rls-lint.js`) to validate that migrations contain the enabling statements, policies, indexes and FK.
- If you need to apply RLS to an existing production table, prefer:
  1. Add index and FK in an idempotent migration.
  2. Add `ENABLE ROW LEVEL SECURITY` and a permissive policy (that includes a bypass condition) in a follow-up migration.
  3. Replace the permissive policy with a strict tenant-matching policy (in a controlled rollout) and verify application behavior.

Example migration snippet (idempotent pattern):

```sql
-- enable rls
ALTER TABLE "MyTable" ENABLE ROW LEVEL SECURITY;

-- create policy only if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = '"MyTable"'::regclass AND p.polname = 'rls_tenant') THEN
    EXECUTE $$
      CREATE POLICY rls_tenant ON "MyTable"
        USING (current_setting('haypbooks.rls_bypass', true) = '1' OR "tenantId" = current_setting('haypbooks.tenant_id', true))
        WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR "tenantId" = current_setting('haypbooks.tenant_id', true));
    $$;
  END IF;
END$$;
```

- Note: The `haypbooks.rls_bypass` session setting may be used during controlled rollouts and by admin scripts; keep this documented and gated.

RLS Phase 1:
- A convenience, idempotent script `scripts/db/apply-rls-phase1.js` applies the initial RLS rollout to a small set of critical tables (`Task`, `Attachment`, `Invoice`). It:
  - ensures a `tenantId` index exists,
  - ensures a `tenantId` FK to `Tenant(id)` exists,
  - enables row level security if not already enabled,
  - creates a `rls_tenant` policy that respects `haypbooks.rls_bypass` for rollouts.
- This script is safe to run multiple times and is intended to be run in CI or during deploy once reviewed.
- After running the script, verify with `node scripts/ci/list-missing-rls.js` to confirm targeted tables no longer appear in the missing RLS list.

2025-12-15: Accountant models migration
------------------------------------
Added `AccountantClient` and `AccountantActivity` and `UserType` enum in migration `20251215120000_add_accountant_models`.
- The migration creates the enum and new user columns idempotently.
- It creates the two new tables, FKs and indexes and explicitly enables RLS and creates a `rls_tenant` policy for both tables.
- The migration uses idempotent SQL and is safe to run multiple times; RLS enabling and policy creation are present to satisfy CI lint checks.

Follow the normal rollout guidance: add indexes/FKs, enable permissive RLS, then replace with strict tenant-isolation policy in a controlled window.

Additional rollout docs:
- See `prisma/DB_RLS_ROLLOUT.md` for a Phase 2 rollout plan, safe commands, and CI recommendations.
