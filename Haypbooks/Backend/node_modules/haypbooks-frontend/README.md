# Haypbooks — Frontend (Developer Guide)

This file documents how to run the Haypbooks frontend locally and how the mock-based development mode works. The project is frontend-first and ships with an in-memory mock API which supports fast iteration, deterministic tests, and demo mode. 

Important: subscription pricing is UI-only in the MVP — there is no payment gateway or functional subscription backend in this repository. Feature flags and infrastructure for subscription integration are reserved for Phase 2.

## Quick start (Windows / PowerShell)

1. Install dependencies

```powershell
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\frontend
npm ci
```

2. Dev server (mock API enabled)

Set the environment variable to enable the mock API and start the dev server:

```powershell
$env:NEXT_PUBLIC_USE_MOCK_API = 'true'
npm run dev
```

3. Dev server (real API - optional)

If you have a backend available and want to call it instead of using the mock layer, clear the env var or set it to `false`:

```powershell
$env:NEXT_PUBLIC_USE_MOCK_API = 'false'
npm run dev
```

## How the mock layers are structured

- Client-side mocks (MSW): runs in the browser during development/test and intercepts network requests.
- In-process mock router (`src/lib/mock-api.ts`): a direct function call path that returns mocked responses without network.
- Seeded in-memory DB (`src/mock/db.ts`, `src/mock/seed.ts`): deterministic dataset used by both MSW handlers and server API routes so behavior is consistent.

Why two mock surfaces? MSW simulates real network interactions for the browser, while the in-process mock router lets the app run without performing HTTP calls (useful for tests or server-only flows). Both share the same seed and business logic.

## Environment variables

- `NEXT_PUBLIC_USE_MOCK_API` (boolean) — toggles mock mode. If `true` the client will use the local mock router / MSW instead of reaching an external backend.
- `NEXT_PUBLIC_SKIP_ONBOARDING` (optional) — development flag that disables automatic onboarding gating in middleware; recommended for tests/CI.

Add these variables to `.env.local` for local usage if needed.

## Running against a local backend (optional)

For local development we *prefer same-origin API requests* so cookies are set and sent by the browser reliably. The Next.js dev server proxies `/api/*` to `http://127.0.0.1:4000` via `next.config.js` rewrites (this is enabled automatically when running `npm run dev` in the frontend and the backend is running on `:4000`).

Recommended (same-origin, preferred for E2E):
```powershell
$env:NEXT_PUBLIC_USE_MOCK_API = 'false'
# Leave NEXT_PUBLIC_API_URL unset (or blank) so the dev server rewrite proxies /api/* to the backend
npm run dev
```

Direct backend (cross-origin, only if you need it):
```powershell
$env:NEXT_PUBLIC_USE_MOCK_API = 'false'
# Set explicit backend origin if you purposely want cross-origin calls
$env:NEXT_PUBLIC_API_URL = 'http://localhost:4000'
npm run dev
```

Note: The backend in `Haypbooks/Backend` is a minimal scaffold and provides simple stub endpoints; it is not a production-ready implementation. Use it for local integration testing only. Make sure to install backend dependencies and run the backend dev server first:

```powershell
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
npm ci
npm run dev
```

## Running tests

Run the test suite (Jest / Testing Library + MSW mocks):

```powershell
npm test
# or, for serial focused tests
npm run test:serial -- src/__tests__/your.file.test.ts
```

## Running Playwright E2E locally (recommended for full flow verification)

This repository includes Playwright E2E specs that exercise signup -> onboarding -> Owner Hub end-to-end. These specs use backend test helper endpoints (OTP retrieval, create/delete test users/companies), so you must run a local backend with test endpoints enabled to run them locally.

Steps to run locally:

1) Start the backend (with test endpoints available). From the `Haypbooks/Backend` folder:

```powershell
cd C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend
npm ci
# apply migrations/seeds if necessary (project-specific command; e.g. npm run db:up)
# then start the dev server
npm run dev
```

2) Start the frontend in non-mock mode so it calls the local backend (same-origin proxy):

```powershell
$env:NEXT_PUBLIC_USE_MOCK_API = 'false'
npm run dev
```

3) Run the Playwright test (set E2E_FULL_AUTH so the spec doesn't auto-skip). You can run a single spec locally:

```powershell
$env:E2E_FULL_AUTH = 'true'
# Run the specific onboarding->hub spec in Chromium
npx playwright test e2e/onboarding.ui-and-hub.spec.ts --project=chromium -g "onboarding: shows"
```

Notes & tips:
- The spec will attempt to detect the company in the Owner Hub UI; if it's not present (backend did not auto-create it during onboarding), the test will call the backend test helper `POST /api/test/create-company` to deterministically create the company and re-check the UI.
- If you prefer a strict assertion that a Company row must exist server-side, set `E2E_ASSERT_COMPANY=true` in the environment when running the tests in CI.
- Ensure the backend exposes the necessary `/api/test/*` endpoints (OTP retrieval, create-company, delete-user, delete-company) for tests to operate deterministically.
- If a Playwright spec is skipped locally, check that `E2E_FULL_AUTH` is set and that your backend test endpoints are reachable at `http://127.0.0.1:4000`.

Notes:
- The test environment uses deterministic seed data so most tests are reproducible. If a test needs a special dataset, see the `src/mock` folder.

## Onboarding and dashboard access (developer note)

The app enforces onboarding gating in middleware: users must complete onboarding before accessing the dashboard. During early frontend work, this gating uses a cookie `onboardingComplete=true` to simulate completion. A lightweight onboarding UX route exists at `/onboarding` for manual completion. For CI/tests you can use `NEXT_PUBLIC_SKIP_ONBOARDING=true` to bypass the gating.

## Subscriptions & billing

Subscription UI is intentionally visual-only in this MVP — the billing/subscription engine, webhook handlers and payment gateway integrations are part of a Phase 2 implementation. The UI will show pricing plans but will not attempt to charge or create real subscriptions until Phase 2 is implemented.

## Small developer utilities (coming)

Planned next steps (I can add these next):
- `scripts/mock-db-export` / `scripts/mock-db-import` (persist and load seeded snapshots)
- `npm run smoke` — quick CI smoke script that boots the app in mock mode and runs a fast UI check using Playwright

Run the smoke check locally (dev server should be running):

```powershell
# start dev server in a separate terminal with mocks enabled
$env:NEXT_PUBLIC_USE_MOCK_API = 'true'
npm run dev

# then in another terminal
npm run smoke
```

### Export / Import mock DB (dev only)

When the dev server is running with mocks enabled you can export the in-memory DB snapshot and import it back.

Export (server must be running):

```powershell
curl -sS -o dev-fixtures/mock-db-snapshot.json http://localhost:3000/api/mock/db/snapshot
```

Import a snapshot back into the running server:

```powershell
curl -sS -X POST -H "Content-Type: application/json" -d @dev-fixtures/mock-db-snapshot.json http://localhost:3000/api/mock/db/import
```

Notes: endpoints are restricted to development or when `NEXT_PUBLIC_USE_MOCK_API=true`. They only merge array/object keys and are intended for developer workflows — do not use in production.

If you want, I can add the README changes to the repository and then implement the small onboarding gating and a minimal onboarding page so you can exercise the flow locally.

---

If you'd like me to proceed with the onboarding gating and small onboarding pages next, say 'Go ahead — add onboarding files and middleware changes' and I’ll implement them and update the Roadmap.v2 notes accordingly.
# HaypBooks Frontend + Mock Backend

Production-ready Next.js + TypeScript + Tailwind UI with built-in mock API routes.

## Features

## Run locally
- Install Node.js 18+
- Install deps
- Start dev server

### Testing & Memory Notes
The test suite can be large; on Windows or constrained environments you may encounter Node heap OOM if too many workers spawn.

Scripts:
- `npm test` (adaptive ~25% workers)
- `npm run test:limited` (hard cap 4 workers – recommended default locally for stability)
- `npm run test:serial` (debugging flakiness, single worker)
- `npm run test:coverage` (limited workers + coverage instrumentation)

If you still see memory issues, lower the max workers further via: `npm run test -- --maxWorkers=2`.

### Search usage and shortcuts
- Global search page: `/search`
	- Type at least 2 characters to trigger search across invoices, bills, customers, vendors, transactions, and accounts.
	- Keyboard: ArrowUp/ArrowDown to move selection, Enter to open the active result, Escape to clear.
	- Accessibility: input uses `role=combobox`, results use `role=listbox` with `role=option` and `aria-activedescendant`.
- Header quick search: submits to `/search?q=...` for a full results view.
- Command palette: `Ctrl/Cmd + K` for navigation and actions.

### SSR base URL in tests
- Server components and route handlers call `getBaseUrl()` (`src/lib/server-url.ts`) which reads Next request headers when available.
- Outside a request scope (most unit tests/SSG), `getBaseUrl()` falls back to `process.env.NEXT_PUBLIC_SITE_URL` or `process.env.SITE_URL`, then `http://localhost:3000`.
- In unit tests that import server components directly, stub the module to avoid "headers called outside a request scope" and to keep fetches deterministic:
	- `jest.doMock('@/lib/server-url', () => ({ getBaseUrl: () => 'http://localhost:3000' }))`
- Optionally set `NEXT_PUBLIC_SITE_URL` in `.env.local` for local SSR fetches. See `.env.local.example` for a prefilled value.

### Notice UX pattern
### Testing the Search UI
- The Search UI includes an RTL test: `src/__tests__/search-ui.test.tsx` covering debounce, grouped results rendering, and keyboard navigation.
- On Windows, run tests in a single worker to reduce memory pressure:
	- `npm run test:serial -- search-ui.test.tsx`
	- Or limit matches: `npm run test -- --maxWorkers=2 search-ui.test.tsx`
- If you encounter heap OOM, close other apps and try `--maxWorkers=1` or increase Node heap: `NODE_OPTIONS=--max-old-space-size=8192`.

- Pages that can receive redirects with a `?notice=message` should render the shared `Notice` component near the top of the page.
- Detail pages that 404 should redirect back to their list route with a human-friendly `notice` query string (e.g., `/invoices?notice=Invoice%20not%20found`).
- When testing server components that import pages rendering `Notice` (a client component), mock `Notice` to avoid invalid hook calls in non-DOM environments.

## Switch to real backend
- Point NEXT_PUBLIC_API_URL to your real API
- Replace calls to internal /api/* with external base URL

## Folder structure
- src/app: app router pages & API routes
- src/components: UI components
- src/styles: Tailwind + global styles

## Notes
- Aligns with Roadmap.v2/Flow.md and Tech.stack.md mock-first approach.

### Exports
- Filenames follow the token rules in `all.about.haypbooks/guides/CSV_Filename_Tokens.md`:
	- Base: `<slug>-<range or asof>-<optional tokens>.csv`
	- When both `start` and `end` are provided, filenames include `YYYY-MM-DD_to_YYYY-MM-DD`; otherwise include `asof-YYYY-MM-DD`.
	- Filter tokens are appended and sanitized (e.g., `tag-tprojectalpha`).
- Unified db-backed exports (mock DB seeding via `seedIfNeeded`):
	- Invoices: `src/app/api/invoices/export/route.ts`
	- Transactions: `src/app/api/transactions/export/route.ts`
	- Bills: `src/app/api/bills/export/route.ts`
	- Customers: `src/app/api/customers/export/route.ts`
	- Vendors: `src/app/api/vendors/export/route.ts`
  - Customer lists:
	- Customer contact list: `src/app/api/reports/customer-contact-list/export/route.ts`
	- Customer phone list: `src/app/api/reports/customer-phone-list/export/route.ts`
  - Vendor lists:
	- Vendor contact list: `src/app/api/reports/vendor-contact-list/export/route.ts`
	- Vendor phone list: `src/app/api/reports/vendor-phone-list/export/route.ts`
- RBAC: All export routes enforce `reports:read`. Tests cover gating behavior and filename token expectations.

### Audit & Reports behavior
- Audit immutability: audit events are append-only and never mutated; reversals are emitted as new events with linking meta (e.g., reversingId) rather than editing history.
- Report pagination: API list endpoints accept typical paging params (`page`, `pageSize`) where applicable. CSV exports stream the full filtered set for determinism in tests; UI list views paginate for performance.

### Invoices backend unification
- All invoices API routes are now backed by the stateful mock DB (`src/mock/db.ts`) with audit logging for create/update/send/apply-payment/void.
- The legacy invoices store has been removed; routes read/write directly via DB helpers. Tests have been updated to validate audit visibility and RBAC gating end-to-end.
- See tests under `src/__tests__` such as `invoice-audit-visibility.test.ts`, `invoice-void-audit-entityId.test.ts`, and `audit-api-extended.test.ts`.

### Bills parity and voiding
- Bills API has full parity including `POST /api/bills/:id/void` which records a `void` audit event with meta `{ reversingId, reason, reversalDate }`.
- UI includes a shared Voiding modal (`src/components/VoidingModal.tsx`) used for both invoices and bills.
	- Requires a reason and, when creating a reversing entry, a reversal date.
	- Accessible dialog (`role=dialog`, `aria-modal`, Escape to close) with polite live announcements.
	- On success, pages reload to reflect updated status and show recent void meta.
- Tests validating parity: `void-workflow.test.ts`, `bill-void-audit-entityId.test.ts`.

### RBAC test override
- Server RBAC respects a role override set via the client RBAC helper during tests. Use this to simulate roles without cookies.
- Example pattern in tests:
	- `import { setRoleOverride } from '@/lib/rbac'`
	- `setRoleOverride('no-reports')` to assert 403s on export endpoints
	- `setRoleOverride('viewer')` or `setRoleOverride('manager')` to allow reads where permitted
- All export route handlers must gate with `reports:read`. Tests cover representative endpoints to prevent regressions.

### Filters parity
- Tags: invoices, bills, and transactions list and export routes accept a single `tag` query param (e.g., `?tag=t:project:alpha`).
- Transactions bankStatus: accepted values are exactly `for_review`, `categorized`, or `excluded` via `?bankStatus=<value>`; list and export apply the same filter set. When you pass `for_review`, results also include items with `bankStatus: imported` (imports are treated as "For Review").

## Back navigation pattern
- Prefer the shared `BackButton` for all Back/Cancel actions. It reads a `from` query param when present, otherwise pushes an explicit fallback route for deterministic behavior.
- When linking list → detail, include `?from=/list-route` on the href so Back returns to the originating list (e.g., `/invoices/[id]?from=/invoices`).
- `BackBar` now follows the same pattern: first uses `from`, then falls back to its `href` prop. Avoid `router.back()` for sequence flows.

## Journals and audit transparency

- Journals list: `/journal` shows recent entries with totals and links to detail.
- Journal detail: `/journal/[id]` renders the lines and includes CSV export (`/api/journal/[id]/export`).
- Audit events: Most API actions record audit entries; pages surface recent activity via `AuditEventsPanel`.

## Payments configuration

- Payments settings are seeded in the mock DB (enabled by default; methods Card/ACH) inside `seedIfNeeded()`.
- Payment methods report and settings endpoints both read from the same DB-backed values to avoid drift.