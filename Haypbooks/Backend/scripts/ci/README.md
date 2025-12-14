# CI scripts for RLS and seed verification

This folder contains helper scripts used by CI and for local verification:

- `verify-rls.js` — runs the SQL-based RLS verification script (`verify-rls.psql`) against the DB.
- `list-missing-rls.js` — diagnostic helper to list tenant-scoped tables missing RLS policies in the DB.
- `migration-rls-lint.js` — lint migrations to ensure CREATE TABLEs with tenant columns are accompanied by RLS enabling or policy creation in migrations.
- `test-rls-enforcement.js` — enforcement test which creates two tenants and a resource, then connects as a limited role to ensure RLS prevents cross-tenant reads/updates.
- `show-account-policies.js` — small debugging helper to inspect Account table policies.

How to run locally (from `Haypbooks/Backend`):

```pwsh
# apply migrations
npm run migrate:run

# run database seeds
npm run db:seed:dev

# run migration lint
npm run lint:migrations:rls

# run SQL verification
npm run verify:rls

# run enforcement test (creates temporary objects and a test role)
npm run test:rls-enforcement
```

Note: These scripts are safe to run repeatedly (they upsert or handle duplicates) but they may leave diagnostic objects in the DB when they create roles/tenants; CI runs in throwaway containers so it's okay in CI.
