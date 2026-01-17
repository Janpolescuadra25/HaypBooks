Central Hub E2E — local dev

Deterministic test strategy: For multi-tenant specs (e.g., Grok.10) we prefer authenticated API-backed operations for state setup (company creation, invite acceptance) to reduce UI timing flakiness. UI interactions are retained when validating UX flows; use API calls for setup unless testing the UI behavior itself.

This test exercises the Central Hub CompanySwitcher end-to-end (login, create companies, click to switch, validate last-accessed behavior).

Requirements
- Backend must be running with test endpoints enabled OR you must run in CI where ALLOW_TEST_ENDPOINTS is set.
- To enable test endpoints locally, set one of:
  - NODE_ENV=test (runs endpoints), or
  - ALLOW_TEST_ENDPOINTS=true (with NODE_ENV=development), or
  - Set ALLOW_TEST_ENDPOINTS_TOKEN to match your local server's expected token.

Running locally (recommended for debugging)
1. Start backend with test endpoints enabled:
   ALLOW_TEST_ENDPOINTS=true NODE_ENV=development npm run start --prefix Haypbooks/Backend
2. Start frontend:
   npm run start --prefix Haypbooks/Frontend
3. Install Playwright browsers once:
   npx playwright install --with-deps --prefix Haypbooks/Frontend
4. Run the focused test:
   npm run e2e --prefix Haypbooks/Frontend -- e2e/central-hub-recent.spec.ts

Notes
- The test will skip itself automatically if the backend test endpoints are disabled (it checks `/api/test/users`), so it is safe to run the whole suite locally without enabling test endpoints; however, for full validation enable the endpoints.
- CI runs the test (db-smoke-on-pr job) with `ALLOW_TEST_ENDPOINTS=true` set so it runs reliably in PRs that affect migrations and seeds.

Phone verification persistence test
- A new focused Playwright spec `e2e/verify-phone-persist.spec.ts` asserts that a phone verification flow results in `isPhoneVerified=true` and `phoneVerifiedAt` being set on the server.
- Prerequisite: ensure the DB migration that adds `isphoneverified` and `phoneverifiedat` has been applied (run `npx prisma migrate dev` / `npx prisma migrate deploy` and `npx prisma generate`) before running the spec locally.

Pre-signup (prevent unverified users in DB)
- A focused Playwright spec `e2e/pre-signup-flow.spec.ts` verifies the pre-signup flow: POST `/api/auth/pre-signup` → no DB user exists yet → navigate to `/verify-otp?signupToken=...` and complete OTP → final DB user is created with `isEmailVerified=true`.
- Prerequisites: set `ALLOW_TEST_ENDPOINTS=true` (or `NODE_ENV=test`) and ensure the backend has been migrated so the `EmailVerificationToken` table exists. For local dev, set `ENFORCE_PRE_SIGNUP=true` when you want `/signup` to route through pre-signup (the server uses the DB-backed `EmailVerificationToken` by default).
- The test will skip itself if the server does not return a `signupToken` from `/api/auth/pre-signup` (so it's safe to run without enabling pre-signup).

Full integrated auth flow (signup → verify → PIN → hub)
- The focused full auth spec `e2e/full-auth-flow.spec.ts` validates the entire sign-up and onboarding pivot (signup, email verification via OTP, PIN setup/entry, hub selection, switch hub, and logout). This spec exercises dev-only test endpoints for deterministic behavior.

Prerequisites & gating
- This spec is gated by the environment variable `E2E_FULL_AUTH`. To run it locally set `E2E_FULL_AUTH=true` and then run the script below.
- Required backend test endpoints must be available and allow the test to:
  - update a user via `/api/test/update-user` (to set `isEmailVerified` / `hasPin`), and/or
  - persist a PIN via `/api/auth/pin/setup`, and
  - return dev OTP via `POST /api/auth/send-verification` (in dev mode) or via `/api/test/otp/latest`.
- If these endpoints are not available, the test will gracefully skip itself and capture diagnostic artifacts for triage.

How to run (examples)
- PowerShell (Windows):
    $env:E2E_FULL_AUTH='true'
    npm run e2e:full-auth --prefix Haypbooks/Frontend
- Bash/macOS:
    E2E_FULL_AUTH=true npm run e2e:full-auth --prefix Haypbooks/Frontend

Triage artifacts
- On failure the test writes traces and logs to `e2e/logs/` and screenshots to `e2e/screenshots/`. Playwright traces and the HTML report are in `playwright-report/` when tests run with reporters enabled.

CI helper scripts
- To run the full auth flow in CI (recommended): set the backend to expose test endpoints and run `npm run e2e:full-auth:ci` from the `Frontend` folder (this sets `E2E_FULL_AUTH=true` for the run and emits a JSON reporter).
- After the CI job finishes, call `npm run e2e:collect-artifacts` to produce `artifacts/e2e-artifacts-<ts>.zip` containing `e2e/logs/`, `e2e/screenshots/`, and `playwright-report/`. Upload that zip as CI artifacts for debugging.

Notes
- The collector script adds placeholder `*-MISSING.txt` files in the zip when any of the directories are absent, making CI logs explicit about missing artifacts.