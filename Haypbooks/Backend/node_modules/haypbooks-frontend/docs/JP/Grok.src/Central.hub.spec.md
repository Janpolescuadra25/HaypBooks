# Central Hub — Companies & Clients (Spec)

**Goal:** Provide a single, *standalone* Central Hub page at `/companies` dedicated to *managing Companies and Clients*. This page is explicitly *NOT* the accounting core: it must not surface accounting tools (ledgers, invoices, bank feeds, exports, reports) directly — those live in the accounting app after the user selects or "opens" a company.

---

## ✨ Design Principles

- **Separation of Concerns:** Central Hub = management & access control for Companies & Clients only. Accounting features belong to the accounting app and are accessible by opening a company from the hub.
- **Hub-first entry:** Post-login landing should take users to `/companies` to make company context explicit and to teach the multi-company model immediately.
- **Fast switching & discoverability:** Provide a persistent mini-switcher and clear affordances to open, invite, and manage companies.
- **Defensive & idempotent:** UI updates (e.g., switching company) must trigger resilient API writes (e.g., update lastAccessedAt) without side effects.

---

## ✅ Allowed vs Forbidden on Central Hub

- Allowed (Hub responsibilities):
  - Create / Edit / Delete company records (managed by tenant owner/admin)
  - Invite users to companies; manage pending invites
  - View subscription & billing summary for tenant (global across companies)
  - Search & filter companies; sort by lastAccessedAt
  - Quick switch into a company's accounting context (navigation action only; no accounting UI on hub)
  - Show meta info like Last Accessed, Plan Tier, Status, Owner, and Contact

- Forbidden (Accounting core features that must NOT appear in hub):
  - Display or edit ledger entries, invoices, bills, bank feeds, payroll runs, tax returns
  - Running exports, report viewers, or any heavy accounting tooling
  - Direct manipulation of accounting transactions — these require opening the company and using accounting routes

> If you need an "Open Books" call-to-action on a card, treat it as a navigation action that sets company context and routes the user into the accounting app area. The hub must not embed accounting widgets.

---

## 🗺️ Navigation & Page Structure

- Route: `/companies` (app-level route — NOT nested under `/accounting`)
- Page components (suggested file layout):
  - `src/app/companies/page.tsx` (or `src/pages/companies/index.tsx` for pages router)
  - `src/components/companies/CompaniesPage.tsx`
  - `src/components/companies/CompanyCard.tsx`
  - `src/components/companies/CompanyList.tsx`
  - `src/components/companies/InviteBanner.tsx`
  - `src/components/companies/CompanySwitcher.tsx` (persistent)

### Layout
- Left Sidebar (global, full-height)
  - Top: Logo (click → `/companies`)
  - Primary nav item: **Companies & Clients** (active when on hub)
  - Secondary items: Billing, Support, Settings (optional — not accounting links)
- Header (inside hub page)
  - Page title, global search, Create Company CTA, persistent CompanySwitcher
- Main content
  - Subscription summary card (if tenant has subscription data)
  - Pending invites card (if any)
  - Tabs: "My Companies" | "Invited" (default to My Companies)
  - Grid or list of CompanyCard components

### After Login Flow
- User logs in → **redirect to `/companies`** (the Central Hub page)
- Even with 1 company → show the full hub to educate about multi-company model
- Optional quick banner: "Open your company books" button for single-company users

### Mini-Switcher & Company Switch Behavior
- CompanySwitcher visible everywhere (top-right). Dropdown shows recent and owned companies.
- Switch action should:
  - Call `PATCH /api/companies/:id/last-accessed` (or a dedicated endpoint) to update `lastAccessedAt` for that TenantUser.
  - Update client-side tenant/company context (React Context, cookie, or store) and route to the selected company's default page (e.g., `/companies/:id/dashboard` or `/app` in accounting app).
  - Not preload accounting data until inside the accounting app to keep hub lightweight.


### Cards & Tabs
- **My Companies** (default): grid of CompanyCard components (name, status, plan, lastAccessedAt, Open Books CTA, menu actions)
- **Invited**: list of invites with Accept/Decline and quick info
- **Empty state**: clear CTA to create a company and short explanation of multi-company benefits


---

## 📡 API Contracts (recommended)

- GET `/api/companies`
  - Response (200):
  ```json
  {
    "companies": [
      { "id":"c_123","name":"Acme Inc","status":"ACTIVE","plan":"PRO","lastAccessedAt":"2025-12-15T12:34:56Z","ownerName":"Alice" }
    ]
  }
  ```

- POST `/api/companies`
  - Body: `{ name, plan? }`
  - Creates tenant-scoped company record

- GET `/api/companies/:id`
  - Returns detail stored on company (not accounting data)

- GET `/api/companies/:id/invites`
  - Returns invites status for that company

- POST `/api/companies/:id/invites`
  - Invite payload: `{ email, role }`

- PATCH `/api/companies/:id/last-accessed`
  - Called on switch to set or upsert `lastAccessedAt` for tenant-user link
  - Idempotent: should set to server time only if newer than stored value (or simply set to now)

Security: All endpoints must respect tenant/RLS rules and only return companies a user belongs to (owner, invited, or admin). Avoid exposing accounting-sensitive fields.

---

## 🔧 Implementation Notes

- Place the hub at top-level in app router (no accounting-core code inside this route).
- Hub should *call* accounting routes only when navigation occurs; never embed accounting views inside hub.
- Keep the hub client-side lightweight: fetch company list (and invite summary) only; avoid heavy joins.
- When opening a company, set a cookie or local storage key that the accounting app reads to set context.
- Update seeds/tests to include tenantUser.lastAccessedAt so the hub can show and sort by last access.

---

## ✅ Tests & QA
- Unit tests
  - CompaniesPage renders banners, tabs, and grid when companies/invites exist
  - CompanyCard displays lastAccessedAt and Open Books CTA
- Integration tests (API)
  - GET `/api/companies` returns tenant-scoped rows
  - PATCH `/api/companies/:id/last-accessed` updates tenant-user lastAccessedAt
- E2E tests
  - Login -> lands on `/companies` (even with single company)
  - Switch company via CompanySwitcher → confirm lastAccessedAt changed and client-side context updated
  - Invite flow: send invite -> pending invites appear in hub -> accept invite -> company appears in invited list
- Accessibility
  - Ensure keyboard access to company switcher & action buttons
  - Proper ARIA on dropdowns and tabs

---

## Implementation Checklist (Developer Friendly) ✅
1. Create page route: `/companies` (top-level)
2. Build CompanyCard, CompanyList, InviteBanner components
3. Add CompanySwitcher component and include it in layout header
4. Wire to API endpoints and add API tests
5. Add e2e tests for login-redirect, switch, invites
6. Ensure hub does not import or render accounting modules; navigation only
7. Update docs + runbook and include a PR checklist entry: "Hub is standalone and contains no accounting tools"

---

## Final notes
- The Central Hub is the canonical *management* surface for Companies & Clients. It should be lightweight, focused, and always point users to the accounting app for transaction-level work.
- If you'd like, I can also scaffold the frontend page and components in a follow-up change (creating `src/app/companies/page.tsx` and starter components + tests). Let me know and I'll queue the implementation tasks.

---

*Spec created: Dec 17, 2025 — Central Hub spec added with explicit separation, routes, API, and tests.*