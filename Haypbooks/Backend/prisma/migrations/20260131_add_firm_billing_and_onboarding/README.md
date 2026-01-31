This migration adds new, additive tables for Firm billing, feature flags, and onboarding progress.

Notes:
- Migration is additive and idempotent: `CREATE TABLE IF NOT EXISTS` used where possible.
- After applying migration, run `npm run prisma:generate` (or `npx prisma generate --schema=prisma/schema.prisma`).
- Use `scripts/migrate_firm_models.ts` to dry-run backfill and `--apply` to create missing seed entries.

Example:
  # dry-run (default)
  node ./scripts/migrate_firm_models.js

  # apply
  node ./scripts/migrate_firm_models.js --apply

Safety:
- This migration does not alter existing tables or drop columns. It is safe to apply on staging after a standard backup.
