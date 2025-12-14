# HaypDeveloper — Building Connectors and Apps for HaypBooks

This guide describes the HaypBooks developer workflow for creating connectors and apps that integrate external platforms (commerce, payments, logistics) with HaypBooks. It is brand‑neutral and applies to any third‑party system.

## Overview

HaypDeveloper provides:

- API documentation and examples
- OAuth 2.0 and API‑key credential flows
- Sandbox and production environments
- App registration and scope management
- Rate limits, webhooks/polling, and retries
- Publishing and audit requirements

The integration model is JSON‑first. Raw payloads are stored, normalized to candidate accounting entries, and then posted once approved.

## Accessing the portal locally

- Run the frontend and navigate to `/developers` on the same localhost origin (e.g., http://localhost:3000/developers). No separate server is required.
- To exercise the mock backend directly from the browser, set `NEXT_PUBLIC_USE_MOCK_API=true` in your dev environment. This routes API calls to the in‑process mock.
- RBAC in dev: set a `role` cookie (e.g., `role=viewer` or `role=admin`) to simulate permissions.

## Core concepts

1. App registration
	- Register your app in HaypDeveloper and choose scopes (read/write for domains like items, customers, orders, payouts, fees).
	- Obtain sandbox credentials (client id/secret or API key). Production credentials are issued after review.

2. Auth flows
	- OAuth 2.0 (confidential/public clients) or API key.
	- All credentials are scoped to a single HaypBooks company when connected.

3. Sync runner (incremental + idempotent)
	- Use source identity keys and/or time‑window checkpoints.
	- Retries must be safe (no duplicates); replays are allowed and should be idempotent.

4. JSON‑first inbox and normalization
	- Persist raw payloads exactly as received.
	- Normalize to candidate journals (orders, fees, payouts) without mutating the ledger.

5. Mapping catalogs
	- Items/SKUs, categories, taxes, counterparties. Support idempotent upsert and preview/validate flows.

6. Posting and audit
	- Users review and choose actions (Post/Ignore). Posting writes journals/transactions; all actions are audited.
	- CSV exports are generated from JSON detail with a version token; filenames use tokens like `{company}_{source}_{yyyymmdd}_{csvVersion}`.

7. Environments
	- Sandbox: seeded sample data for testing.
	- Production: real company data; RBAC and closed‑period guards apply.

## App Transactions alignment

When your app connects and begins syncing, HaypBooks surfaces an App transactions area:

- Shows each connector with status and last sync time.
- Stages incoming entries for review (Sales, Fees/Expenses, Payouts).
- Supports mapping and CSV exports from JSON detail.

## Developer quick start

1. Register your app in HaypDeveloper and select scopes.
2. Implement OAuth or API key auth; store credentials securely.
3. Build an incremental sync that persists raw payloads and maintains checkpoints.
4. Produce normalized candidate entries; support mapping catalogs.
5. Expose CSV exports from JSON; include a CSV‑Version header/flag.
6. Emit audit events for sync, map, post, ignore; handle retries safely.

### API Explorer (mock)

- The portal now provides a dedicated API Explorer page at `/developers/explorer` (linked from the button on `/developers`). It reads `/openapi/apps.mock.json` for App Transactions endpoints (connectors, sync, postings, preview, post, ignore).
- Reads require `reports:read`; writes require `journal:write`. When missing, the server returns 403 and UI actions are disabled.
- Quick test:

```
curl -s http://localhost:3000/api/apps/connectors
```

## Troubleshooting

- 404s for documentation endpoints usually indicate moved content; use the main docs index and versioned links.
- If you encounter rate limits, respect backoff headers and resume from your last checkpoint.
- For auth errors, refresh tokens promptly and rotate credentials per policy.

## Security and compliance

- Follow least‑privilege scopes, encrypt secrets at rest, and rotate on cadence.
- Enforce RBAC and closed‑period protections for posting and voiding.

For questions or access requests, contact the HaypDeveloper team via your partner channel.

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

North star: reduce time-to-first-success
TTF-API: <10 minutes from landing on the page to a successful API call in the sandbox.
TTF-Webhooks: <30 minutes to receive a signed webhook event in a sample app.
Docs-to-Console loop: every doc has a “Try it” link that opens prefilled in the API Explorer with a test company.
Information architecture (MVP → V2)
Home (developers landing)
Hero: “Build connectors and apps for HaypBooks”
Primary CTAs: Get API Keys, Explore API, Try Sandbox, Quickstart
Secondary: Changelog, Status, Sample apps
Build (Guides)
Quickstarts: OAuth/API key, incremental sync, webhooks, posting & audit, CSV-Version
How-tos: App Transactions mapping, paging/retries, idempotency, closed-period guards, RBAC scopes
Best practices: JSON-first, filename tokens, rate limiting, error contracts
Reference (API)
OpenAPI-based reference (searchable, deep links, examples for cURL/JS/Python)
Live “Try it” with sandbox creds; auto-injects base URL and headers
Error catalog: codes, messages, remediation
Console (Developer dashboard)
Apps list: create/rename/disable; environments (Sandbox/Production)
Credentials: client id/secret, redirect URIs, scopes, key rotation
Webhooks: subscribe endpoints, event types, signing secret, test delivery, replay
Usage & logs: request counts, 4xx/5xx, webhook delivery logs
Status & Changelog
Status page with uptime and incidents (JSON status endpoint)
Changelog with deprecation windows and version policy
Community & Support
Contact, discussion forum (or GitHub issues), security.txt, report vulnerability
Contracts and policies (what devs look for fast)
Auth
OAuth 2.1 (Authorization Code with PKCE) for user/tenant-scoped apps
API keys for server-to-server integrations (scoped + rotatable)
Scopes aligned to RBAC: reports:read, journal:write, invoices:write, bills:write, audit:read, etc.
Versioning
Date-based or v1/v2 in path; breaking-change policy and deprecation timeline (e.g., min 90 days)
Errors
JSON shape: { code, message, details?, docUrl? }
Closed period standard payload: { code: 'PERIOD_CLOSED', closeDate, requestedDate }
Rate limits
Global + per-app; headers: X-RateLimit-Limit/Remaining/Reset
Retry-After guidance and backoff examples
Idempotency
Idempotency-Key header on POST/PUT; deterministic outcomes
Webhooks
HMAC signing with timestamp; replay window; recommended verification code snippet
Event types: apps.sync.completed, apps.posting.created, journal.posted, period.closed, etc.
Sandbox strategy
“Test company” per developer with seed data (accounts, a few invoices/bills, sample postings).
Toggleable “Use Mock Backend” flag (you already have MSW/mock routes) so Quickstarts run offline.
One-click “Send test event” to the webhook URL with live delivery logs.
Postman collection and a downloadable .http file (VS Code REST Client) prefilled for sandbox.
Documentation style (JSON-first, brand-safe)
Examples show raw JSON requests/responses first; CSV derives from JSON routes.
Filenames must use tokenized patterns with CSV-Version support.
Avoid competitor brand names in all portal copy (references belong only in comparison docs, not the portal).
What to add to your current /developers page next
Add a right-rail API Explorer embed (Swagger UI/Redoc/RapiDoc) reading an OpenAPI spec (start with Apps subset you already expose: connectors, sync, postings, preview/post/ignore).
Add “Create your first app” section with:
Temporary “Mock keys” now; swap to real app registration later.
Step-by-step OAuth with PKCE (diagram + copy-paste snippets).
A curl/Python/JS snippet that calls GET /api/apps/connectors in sandbox.
Add a Webhooks section: sample signature verification snippet and a “Send test event” button (mock).
Add a “Policies” panel: versioning, rate limits, error model, deprecation window.
Add Sample apps: minimal Node/Express and Next.js examples showing OAuth, a simple sync, and webhook handling.
Phased rollout
MVP (1–2 sprints)
OpenAPI for current mock endpoints (Apps + Reports read routes)
API Explorer on /developers
Quickstarts: OAuth/API key (mock), Webhooks (mock), Sandbox “Try it”
Postman collection + .http file
Changelog page scaffold
V2
Developer Console: app registration, keys, webhooks, usage logs, key rotation
Status page + JSON status endpoint
SDKs (generated from OpenAPI): JS/TS and Python first
Full portal search across Guides + Reference
V3
Marketplace submission flow (optional): scopes, review checklist, app listing metadata
Fine-grained analytics and per-scope insights
Multi-tenant test companies and data reset tooling
Align with what you already have
Lean into your JSON-first, RBAC, and closed-period guard patterns—surface these as core principles in the portal.
Tie the “App Transactions” guide directly to the posting preview/post endpoints (now role‑gated).
Keep brand safety: in-product text and portal copy stay neutral; use platform names only for connector targets in technical references.
Success checklist (what we’ll measure)
Docs search success rate and “first successful API call” conversion from the landing.
Error-driven learning: clicks on docUrl from error payloads reduce repeated 4xx/5xx.
Webhook delivery success rate and time-to-verify (from “Send test event”).

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

You can (and should) serve the HaypDeveloper portal from the same frontend you’re already running—no separate localhost needed. With your app up, just open this route in your browser:

http://localhost:3000/developers
If you prefer a different dev port, use that port number; the key is it’s the same origin and app, under the /developers path.

Recommended setup for local use
Same-app route (recommended now)

Keep the portal at /developers inside your Next.js app. This avoids CORS headaches, lets your “Try it” examples call in-process mock endpoints, and reuses your RBAC and UI shell.
You already have the page at src/app/developers/page.tsx, so once the frontend is running, visit /developers.
Mock backend for instant demos

Set NEXT_PUBLIC_USE_MOCK_API=true in your dev environment so the API Explorer and Quickstarts use your in-process mock endpoints (no backend required).
This makes “GET /api/apps/connectors” and similar examples run from the browser immediately.
RBAC while you test

The portal (and App Transactions) now enforce permissions:
View/Preview requires reports:read
Sync/Post/Ignore requires journal:write
To simulate roles locally, set a cookie in your browser console:
document.cookie = 'role=viewer; path=/' (read-only)
document.cookie = 'role=admin; path=/' (full access)
When to split it out later
Keep it same-app for MVP and early integration. If you eventually want a public developer site:
Subpath: https://yourapp.com/developers (stays same origin for console/API explorer)
Or subdomain: https://developers.yourapp.com (set CORS and shared auth carefully)
The content can be static (OpenAPI + docs) while the “Console” pages proxy to your API.
Quick sanity check
The page exists at page.tsx
Docs are tracked in All.about.Haypdeveloper.md
App Transactions live UI is at Transactions → App transactions; the portal references those endpoints
There is a "Developers" link in the app header that points to `/developers`. It’s available in dev and reuses the same UI shell and RBAC you already use elsewhere. From there, use the "Open API Explorer" button to navigate to `/developers/explorer`, which reads the local OpenAPI stub for the Apps endpoints you already mock.