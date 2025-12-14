## Final Tenant ID Implementation

- Status: tenantId columns are TEXT across all tenant-scoped tables.
- All `tenantId_uuid_old` and `tenantId_txt` backup columns have been removed from the DB (no orphaned backups remain).
- RLS policies reference `tenantId` (TEXT) and are enforced; `lint:migrations:rls` confirms RLS policy presence and correctness.
- All tenant FKs and indexes validated; `inspect:tenant-types`, `list:tenant-fks`, and `schema-completeness-check.js` pass.
- CI guard: `lint:db:fail-on-backups` is now run by `scripts/ci/db-ship-check.js` to prevent reintroduction of backup columns.

Checklists and next steps:
- Add/verify CI job that runs `node ./scripts/ci/db-ship-check.js` in the pipeline before merging migrations.
- Schedule a maintenance window to apply the final cleanup migration (if not applied) to drop backups in production.
- Confirm no new migration phases recreate `tenantId_uuid_old` by adding a migration review checklist item to PRs that add/modify RLS policies or tenant_id migrations.

Notes:
- This doc is a quick reference for the current tenantId final state and how to maintain it. See DATABASE_MIGRATION_COMPLETE.md for the migration details and scripts used during conversion.

---
Generated: 2025-12-13
