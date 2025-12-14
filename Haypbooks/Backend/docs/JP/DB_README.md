HaypBooks Backend - Database & Migration Guide

This folder contains Prisma schemas and SQL migration files to bring your Backend from mock repositories → production-ready PostgreSQL.

Phased migration order
----------------------
1. Phase 1 - Authentication + OTP
   - Apply: prisma/migrations/phase1-auth.sql
   - Adds: User, Session, Otp tables

2. Phase 2 - Company onboarding + multi-user
   - Apply: prisma/migrations/phase2-companies.sql
   - Adds: Company, CompanyUser, Company role enum

3. Phase 3 - Accounting core
   - Apply: prisma/migrations/phase3-accounting.sql
   - Adds: ChartOfAccount, JournalEntry, JournalEntryLine, Customer, Vendor, Invoice, InvoiceLine

How to use
----------
0. Initialize your DB and set DATABASE_URL in .env
1. Install Prisma in backend: npm i prisma @prisma/client
2. Apply SQL migrations to database in given order (or use Prisma migrate if you prefer to scaffold migrations)
3. Run: npx prisma generate
4. Wire the new PrismaRepositoriesModule in your AppModule (or replace existing mock module providers)
5. Ensure your services use the injected repository tokens (USER_REPOSITORY, SESSION_REPOSITORY, OTP_REPOSITORY)
Toggle mock vs real repositories
-------------------------------
By default the application will use the real Prisma repositories. To run the server with mock in-memory repositories (useful for quick testing), set the environment variable:

   USE_MOCK_REPOS=true

When `USE_MOCK_REPOS` is set, the application imports the `MockRepositoriesModule` instead of `PrismaRepositoriesModule`.


Running migrations & seed (local dev)
----------------------------------
1. Copy `.env.example` -> `.env` and edit `DATABASE_URL` if needed.
2. Start a local Postgres via docker compose:

   docker compose up -d

3. Run the migration runner (executes the SQL files in prisma/migrations):

   npm run migrate:run

Optional: verify schema (checks required columns)
-----------------------------------------------

After applying migrations you can run a quick schema check to make sure required columns are present (this is run automatically in CI):

   npm run migrate:check

This command will exit non-zero if the `User` table doesn't include required columns like `role` or `onboarding_mode` — useful for CI or local validation.

4. Generate Prisma client (after migrations):

   npm run prisma:generate

5. Seed demo data for development:

   npm run db:seed:dev

6. Stop the local DB when finished:

   npm run db:down


Notes
-----
- Migrations are additive and ordered; they are purposely simple SQL for portability.
- For production, use safe roll-forward migrations (create new migrations in separate files). Ensure backups & review.

Troubleshooting: Prisma "column does not exist" errors
-----------------------------------------------------

If your running app or tests fail with Prisma errors like "The column `User.role` does not exist in the current database", it means the DB schema is out-of-sync with the application code. Steps to resolve:

1. Ensure your DATABASE_URL points to the correct database and you have applied migrations for this repository.
2. Run the migration runner from the Backend folder (uses the SQL files in prisma/migrations):

   npm run migrate:run

3. If the app still errors, double-check that the DB used by CI/staging/prod has the migrations applied — apply them there too. Adding a CI step which runs migrations before starting services is recommended.

If you want me to add an automated migration-check in the GitHub Actions workflows so tests can't run until migrations are applied, I can implement that next.
