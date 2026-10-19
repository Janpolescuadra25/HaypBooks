# GL Idempotency Module Implementation

## STATUS: DONE

### Problem Statement
Prior to this implementation, the system could create duplicate journal entries when retries or webhook callbacks replayed an identical financial request. The logic was effectively keyed off non-authoritative fields instead of a dedicated database-level dedupe key.

### Schema Design
The canonical fix adds a dedicated unique key to the `JournalEntry` model:

```prisma
/// Stable dedupe key to prevent duplicate journal postings across retries and callbacks
idempotencyKey    String?       @unique
```

This guarantees that the same idempotency key cannot be reused across the same company and eliminates the duplicate-post failure mode at the database boundary.

### Engine Integration
The `createAndPostJE` helper in `Haypbooks/Backend/src/shared/gl-integration.ts` now:

1. Queries `journalEntry` via `findUnique({ where: { idempotencyKey } })`.
2. Rejects cross-company collisions with a fail-closed error.
3. Returns the existing journal entry ID when a matching request is replayed.
4. Persists the idempotency key on new entries inside the same transactional write.

### Migration Artifacts
- Base migration: `Haypbooks/Backend/prisma/migrations/20260929000000_add_journal_entry_idempotency_key/migration.sql`
- Forward cleanup migration: `Haypbooks/Backend/prisma/migrations/20260929140000_remove_redundant_idempotency_index/migration.sql`

### Verification
All required quality gates were re-run successfully:

- `npx prisma generate` — PASS
- `npx tsc --noEmit --pretty false` — PASS
- `npm run lint -- --quiet` — PASS
- `npm run typecheck` — PASS

### Source References
- `Haypbooks/Backend/src/shared/gl-integration.ts`
- `Haypbooks/Backend/prisma/schema.prisma`
- `docs/Road_Map/Road_Map.md`
