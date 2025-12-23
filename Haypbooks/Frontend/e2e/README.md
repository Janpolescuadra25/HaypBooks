Central Hub E2E — local dev

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