# CI: Playwright DB-persistence e2e

This repository contains a GitHub Actions job which runs a focused Playwright test that validates database persistence across auth flows (create user → forgot-reset → login → session stored).

Key points:

- Workflow path: `.github/workflows/db-persistence-e2e.yml`
- It runs on push & pull_request for `main` / `master`.
- Services: Postgres (image postgres:15), database `haypbooks_ui_test`.
- Backend must be started with `ALLOW_TEST_ENDPOINTS=true` so the Playwright test can use test-only endpoints (e.g. `/api/test/create-user`, `/api/test/otp/latest`, `/api/test/sessions`).

How the workflow works (high level):

1. Install backend deps, run migrations and seeds using `DATABASE_URL` pointing to the postgres service.
2. Build and start backend with `ALLOW_TEST_ENDPOINTS=true` (CI environments typically also set `CI=true`, which allows test endpoints when ALLOW_TEST_ENDPOINTS=true). You can alternatively set `NODE_ENV=test` to allow test endpoints explicitly.
   
	Important: As a safety pre-flight CI step we now run `npm run migrate:check` in the Backend to validate the DB schema (ensures required columns like `User.role` and `User.onboarding_mode` exist) before the backend is started. This causes the workflow to fail early and clearly if a migration wasn't applied.
3. Install frontend deps, build and start frontend.
4. Install Playwright browsers and run the single e2e test `e2e/db-persistence.spec.ts`.

Run the test locally (recommended steps to mirror CI):

1. Start a local Postgres instance (Docker) with a test DB. Example:

```pwsh
# in PowerShell
docker run --name hb-test-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=haypbooks_ui_test -p 5432:5432 -d postgres:15
```

2. From `Haypbooks/Backend` run migrations & seed (set DATABASE_URL):

```pwsh
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/haypbooks_ui_test'
npm ci
npm run migrate:init
node ./scripts/migrate/run-sql.js
npm run db:seed:dev
```

3. Start backend with test endpoints enabled:

```pwsh
$env:DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/haypbooks_ui_test'
$env:ALLOW_TEST_ENDPOINTS = 'true'
npm run dev
```

4. From `Haypbooks/Frontend` install deps and start the dev server (ensure NEXT_PUBLIC_API_URL points to `http://localhost:4000` if necessary):

```pwsh
npm ci
npm run dev
```

5. Install Playwright browsers and run the single test (or run the whole Playwright suite):

```pwsh
npx playwright install --with-deps
npx playwright test e2e/db-persistence.spec.ts --project=chromium --reporter=list --timeout=120000
```

Notes & safeguards:

- The test-only endpoints are intentionally gated and can only be enabled in safe environments.

	Acceptable ways to enable test endpoints:

	- Set `NODE_ENV=test` (explicit test environment), or
	- Set `ALLOW_TEST_ENDPOINTS=true` in development, or in CI where `CI=true` will permit it, or
	- Set `ALLOW_TEST_ENDPOINTS_TOKEN` to a secure token and use that as an additional gating mechanism.

	Ensure you never enable test endpoints in production without explicit, auditable safeguards.
- CI uses `postgres:15` and `postgres` / `postgres` credentials for simplicity. Adjust as needed for stricter security.
