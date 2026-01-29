Purpose
-------
This focused migration completes the WorkspaceUser conversion to use uuid tenant ids without performing destructive drops.

What it does
------------
- Adds `tenantId_new uuid` to `WorkspaceUser`, `CompanyUser`, and `PracticeUser` (idempotent: only added if missing).
- Backfills `tenantId_new` from `tenantId_old::uuid` where applicable.
- Creates a unique index `WorkspaceUser_tenant_user_unique` on (`tenantId_new`, `userId`) to allow composite FK referencing.
- Adds composite FK constraints `CompanyUser_tenantId_userId_fkey_new` and `PracticeUser_tenantId_userId_fkey_new` referencing `WorkspaceUser(tenantId_new, userId)` **AS NOT VALID** to avoid long locks.
- Attempts best-effort validation of NOT VALID FKs involving `tenantId_new` and logs which constraints were validated or could not be validated.

Manual operator steps (do after reviewing validation results)
-----------------------------------------------------------
1) Inspect any constraints that remain NOT VALID and query offending rows (see validator script `scripts/db/validate-tenant-fks.js`).
2) Fix offending rows (update or delete) as necessary.
3) Drop any old FK constraints that reference `tenantId_old`.
4) Drop old indexes on `tenantId_old` and drop `tenantId_old` columns.
5) Rename `tenantId_new` -> `tenantId` on the affected tables.
6) Recreate indexes and constraints with the original names if necessary.

Notes
-----
- The migration intentionally avoids destructive operations to give operators a chance to validate data before irreversible changes.
- Run the validator after this migration to discover any failing rows and to help with manual remediation:
  node ./scripts/db/validate-tenant-fks.js 'postgresql://<user>:<pass>@<host>:<port>/<db>'
