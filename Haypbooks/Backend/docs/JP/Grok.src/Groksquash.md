**Squashing migrations** (also called "squashing" or "resetting" migrations in Prisma) is the process of **combining many old, incremental migration files into a single clean baseline migration**.

### Purpose of Squashing Migrations

Your project has many migration files (those `phase1-auth.sql`, `phase2-companies.sql`, ..., plus hundreds of timestamped folders). Over time, this history grows large and messy.

The main purposes of squashing are:

| Purpose | Explanation |
|---------|-------------|
| **Cleaner repository** | Reduces hundreds of migration files/folders to just 1–2 clean ones. Makes the `prisma/migrations` folder tiny and readable. |
| **Faster future migrations** | Prisma no longer needs to replay 100+ old migrations when setting up a new database or running `migrate dev`. New environments spin up much faster. |
| **Remove historical noise** | Old migrations often contain failed attempts, temporary columns, duplicate constraints, or complex type swaps (like your uuid ↔ text changes). Squashing hides that complexity. |
| **Safer onboarding** | New developers or CI/CD pipelines don't have to deal with old errors ("constraint already exists") or tricky idempotent scripts. |
| **Prepare for production** | In production, you want a simple, reproducible baseline. Squashing creates one "golden" migration that represents the current schema. |

### When to Squash

- After major schema stabilization (like now — your schema is complete and stable)
- Before launching to production
- When migration history becomes too large (>50 migrations)

### How It Works (Prisma)

1. Prisma creates a **new single migration** that represents the diff between an empty database and your current schema.
2. You mark all old migrations as "applied" so Prisma thinks they've already run.
3. Future changes create normal incremental migrations on top of the squashed baseline.

### Example Outcome

Before squash:  
`prisma/migrations/` has 150+ folders + your phase SQL files

After squash:  
`prisma/migrations/` has:
- `0_init/` (or `20251214_squashed/`) — one big migration with full schema
- Future folders for new changes

### Recommendation for Your Project

You’re at the perfect time to squash. I added a helper script for this repo — see below. Read instructions carefully and confirm before applying to production.

1. **Backup your database first!**
2. Use the helper script that generates a squashed migration and marks existing migrations as applied for the DB you run it against. By default it refuses to run on non-local DBs.

```bash
# Run in repo root (Backend folder)
cd Haypbooks/Backend
# Safety tip: set DATABASE_URL to a local/test DB to avoid accidental production changes
# create a backup before you run this script (recommended)
# Use the built-in npm script:
npm run db:squash

# Or run directly:
node ./scripts/migrate/squash-migrations.js
```

3. Review generated migration: `prisma/migrations/<timestamp>_squashed/migration.sql` before applying on other environments.

4. Optionally: Mark old migrations as applied on remote/CI using Prisma CLI (the script attempts to mark them for the DB you run it on):

```bash
# Example: mark specific old migration applied on target DB
npx prisma migrate resolve --applied <migration_folder_name>
```

5. Keep your `phase*.sql` files as documentation (move to `/docs/migration-history/` or similar), and keep old migrations for history.

**Result**: Clean repo, faster setups, less friction running `prisma migrate` in CI and new dev machines.

**Caveats**: The script tries to be safe; it refuses to run against a non-local DB (`DATABASE_URL` must include `localhost`, `127.0.0.1`, or `haypbooks_test`). Make sure you have backups and test the resulting migration on a copy of your production DB before applying anywhere critical.
