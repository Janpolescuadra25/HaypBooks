Title: Squash-validate: land conversion migration, validate squashed baseline, and CI matrix

Summary:
- Add a robust conversion migration to convert Tenant.id and tenantId columns to UUID with safe fallbacks and idempotency.
- Improve `scripts/db/squash-validate.js` to:
  - prefer `Backend/prisma` locations for schema and migrations,
  - use pinned Prisma version via `npx prisma@<version>` to avoid Prisma v7 schema validation errors,
  - attempt whole-file execution of pre-conversion PL/pgSQL blocks and fallback to statement-by-statement execution,
  - copy the squashed migration and optionally run `guard-squashed-migration.js` when `SQUASH_GUARD=1`,
  - invoke `prisma generate --schema` with pinned prisma and run seeds with `npm --prefix`.
- Add `scripts/db/guard-squashed-migration.js` (existing) and keep it behind `SQUASH_GUARD` feature flag.
- Update `.github/workflows/squash-validate.yml` to run a matrix for `SQUASH_GUARD=[1,0]` to validate both guarded and unguarded runs in CI.

Files changed (summary):
- Backend/prisma/migrations-preview/20251215020000_convert_tenantid_to_uuid/migration.sql (improved conversion logic)
- Backend/prisma/migrations/20251215020000_convert_tenantid_to_uuid/migration.sql (copied landing migration)
- Backend/prisma/migrations/20251213202646_squashed_uuid/migration.sql (squashed baseline; some idempotency changes applied)
- Backend/scripts/db/squash-validate.js (multiple robustness improvements, schema detection, --schema usage, pinned prisma invocation, seed invocation fixed)
- .github/workflows/squash-validate.yml (matrix job for guarded and unguarded runs)

Testing performed locally:
- Run `node scripts/db/squash-validate.js` with `SQUASH_GUARD=1` and `SQUASH_DIR=20251213202646_squashed_uuid` — migrations applied, prisma generate succeeded, smoke seeds executed.
- Repeated unguarded runs (`SQUASH_GUARD=0`) 5x — all succeeded; no duplicate-relation errors reproduced.
- Ran lint and verification scripts against the validated DB (`haypbooks_dev_squash_validate`) with `DATABASE_URL` set — `lint:migrations:rls`, `verify:expected-schema`, `lint:db:schema-complete`, `lint:db:tenant-indexes`, `lint:db:tenant-coltypes` succeeded.

Suggested PR description body (copy into PR):
- Brief: land conversion migration, make squash validation robust, and run both guarded and unguarded validation in CI.
- Why: ensure that the squashed baseline is idempotent and deployable across fresh DBs and that the Tenant ID canonicalization to UUID is safe.
- Next steps: monitor CI for a few PR cycles; once both matrix jobs are reliably green, remove `SQUASH_GUARD` and delete `guard-squashed-migration.js`.

Commands to create branch and open PR (if you have a remote origin):

```bash
# from repo root
git checkout -b feat/squash-validate-tenantid-uuid
git add .
git commit -m "squash-validate: land convert tenantid->uuid, robust validation & CI matrix"
git push -u origin feat/squash-validate-tenantid-uuid
# Open PR via GitHub UI or use gh cli:
# gh pr create --fill --base main --head feat/squash-validate-tenantid-uuid
```

If you want, I can initialize a git repo and open the PR for you (I need remote details), or I can provide an applyable patch file you can use locally.
