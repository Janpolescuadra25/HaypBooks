Test-only API endpoints (dev/test only)

These endpoints are intended for local development and automated tests. They are guarded and require explicit enabling so they are not accidentally exposed in production.

Allowed scenarios (any one of the following):

- NODE_ENV=test (explicit test environment), or
- ALLOW_TEST_ENDPOINTS=true AND (running in development, OR running in CI, OR ALLOW_TEST_ENDPOINTS_TOKEN is set). 

This means simply setting ALLOW_TEST_ENDPOINTS=true on a production server will not enable the endpoints unless one of the above conditions holds. CI runs (e.g., GitHub Actions) typically set CI=true which will permit ALLOW_TEST_ENDPOINTS=true to enable test endpoints.

Available endpoints (all under /api/test):

- GET /api/test/users
  - Returns a list of users (safe fields) for quick inspection. Example: http://localhost:4000/api/test/users

- GET /api/test/user?email={email}
  - Returns a single user row (including password hash in dev) for that email. Use only in dev. Example: http://localhost:4000/api/test/user?email=demo@haypbooks.test

- GET /api/test/companies?email={email}
  - Returns a list of `Company` rows for the tenant(s) associated with the provided user's email (useful to assert a company was created during onboarding). Example: http://localhost:4000/api/test/companies?email=demo@haypbooks.test

- POST /api/test/create-company
  - Creates a `Company` for the tenant associated with the provided user's email. If the user is not associated with any tenant, the endpoint will optionally create a new Tenant and link the user (test-only convenience). Payload: `{ email: string, name: string, currency?: string, createTenant?: boolean }`. Example: `POST http://localhost:4000/api/test/create-company` with JSON body `{ "email": "e2e-owner-123@haypbooks.test", "name": "OwnerCo E2E 123" }` — returns `{ created: true, company: { id, tenantId, name, ... } }`

- POST /api/test/delete-company
  - Deletes `Company` rows matching the provided `companyId` or `email` + `name` if they appear to be test-created. The endpoint is conservative: it only deletes companies where `name` contains `E2E`, or the associated tenant has a `subdomain` starting with `e2e-`, or the tenant `name` contains `(E2E)`. Optional payload: `{ companyId?: string, email?: string, name?: string, deleteTenant?: boolean }`. Example: `POST http://localhost:4000/api/test/delete-company` with `{ "email": "e2e-owner-123@haypbooks.test", "name": "OwnerCo E2E 123", "deleteTenant": true }` — returns `{ deleted: N }` (number of companies deleted).

- GET /api/test/otp/latest?email={email}&purpose={RESET|VERIFY}
- POST /api/test/force-complete-signup { signupToken } (dev/CI only) - force finalize a pending pre-signup into a verified user
- POST /api/test/force-verify-user { email|phone, type } (dev/CI only) - mark an existing user's email or phone as verified for deterministic tests
- POST /api/test/force-complete-onboarding { email, mode=(quick|full) } (dev/CI only) - mark onboardingComplete=true and set onboardingMode for a user
  - Returns the latest OTP record for the email and purpose.

- POST /api/test/create-user
  - Create a new user (dev-only) with JSON { email, password, name, isEmailVerified }.

- GET /api/test/sessions?email={email}
  - Lists session rows for the given email (useful to confirm refresh sessions created on login).

Usage tips
- For local development, set NODE_ENV=development and ALLOW_TEST_ENDPOINTS=true. Example:

  # powershell
  $env:NODE_ENV = 'development'
  $env:ALLOW_TEST_ENDPOINTS = 'true'
  npm run dev

- For CI runs (GitHub Actions), set ALLOW_TEST_ENDPOINTS=true (CI environment variables are present in Actions so test endpoints will be enabled). Example snippet in GitHub Actions env:

  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/haypbooks_ui_test
  ALLOW_TEST_ENDPOINTS: 'true'
  # optionally set NODE_ENV=test for clarity
  NODE_ENV: 'test'

- For extra safety, you can use ALLOW_TEST_ENDPOINTS_TOKEN on the server instead of enabling ALLOW_TEST_ENDPOINTS alone. When set (non-empty), it also permits the endpoints.

## Phone verification persistence & E2E
- Migration: A migration was added to persist phone verification to the `users` table (`isphoneverified` Boolean and `phoneverifiedat` DateTime). Apply it locally before running tests:

- Note: Phone inputs are normalized on signup using the project's phone util (E.164 or digits-only fallback) and stored in `users.phone`. For privacy, avoid logging raw phone numbers in production and consider a hashed/HMAC lookup or separate PII table for phone-based lookups; tests and debug endpoints intentionally mask phone display values.

  - Run migrations (dev/local): `npx prisma migrate dev --name add_user_phone_verified` (or `npx prisma migrate deploy` in CI-like scenarios)
  - Regenerate the Prisma client: `npx prisma generate`

- Local E2E run (dev):
  - Start backend with test endpoints enabled:

    # powershell
    $env:ALLOW_TEST_ENDPOINTS = 'true'
    $env:NODE_ENV = 'development'
    npm --prefix Haypbooks/Backend run start:dev

  - Run the Playwright spec that asserts phone verification is persisted:

    npm --prefix Haypbooks/Frontend run e2e -- e2e/verify-phone-persist.spec.ts

- CI: The Playwright workflows (`.github/workflows/ui-e2e.yml`, `db-smoke-on-pr.yml`, `db-persistence-e2e.yml`) already set `ALLOW_TEST_ENDPOINTS: 'true'` so the test endpoints are available in CI. Ensure migrations are applied in any workflow that runs DB-dependent E2E (the workflows in the repo already run migrations/seeds beforehand).

- Privacy note: Phone lookups are normalized to E.164 before lookup. If you later need to reduce sensitivity of test helpers, consider adding a hashed-lookup column or separate test-only lookup field.

Security
- DO NOT expose these endpoints in production. They are intentionally permissive and return sensitive dev-only details (password hashes, sessions, etc.) solely for testing.
