# HaypBooks — Development Roadmap

> Last updated: August 2026

---

## Production-Validated Features (Implemented)

These features are code-complete in the repository. They require production validation testing after R2 VPS deployment.

### Core Accounting Module
- [x] Chart of Accounts — Tree structure with parent/subaccount support, type-based coloring, 9+ account types including Contra accounts
- [x] Journal Entries — Double-entry enforcement, real-time debit/credit balancing, recurring entries (Monthly/Quarterly/Yearly), copy-as-new, attachment support, customer tracking
- [x] Journal Entry Lifecycle — Draft → Posted → Voided status workflow, audit log access, bulk actions, filtering by status/source type
- [x] General Ledger — Unified view across all modules (invoices, bills, JEs, banking), 13 source type filters, drill-down to source documents, CSV export, running balance, hidden columns persistence

### Financial Statements
- [x] Trial Balance — Endpoint: `GET /api/companies/:companyId/accounting/trial-balance`, frontend: `TrialBalancePage.tsx`
- [x] Profit & Loss — Endpoint: `GET /api/reporting/profit-and-loss`
- [x] Balance Sheet — Endpoint: `GET /api/reporting/balance-sheet`
- [x] Cash Flow Statement — Endpoint: `GET /api/reporting/cash-flow`

### Bank Reconciliation
- [x] Full reconciliation lifecycle (create, match, unmatch, auto-match, undo, complete)
- [x] Endpoints in `banking.controller.ts` — list, create, complete reconciliations
- [x] Frontend: `BankReconciliationPage.tsx` — setup flow, transaction matching, real-time summary, print report, pagination/search/filter, history view

### Audit Logging
- [x] `AuditLogLine` Prisma model — captures before/after values at field level
- [x] Audit logging for Chart of Accounts and Journal Entries
- [x] Audit logging for banking transactions (deposits, withdrawals, transfers)
- [x] Audit logging for invoices, bills, and payments (create, update, void)
- [x] Audit logging for contacts (customers and vendors — create, update, soft-delete)
- [x] Audit logging for inventory items (create, update, delete)
- [x] Global audit controller: `GET /api/companies/:companyId/audit-logs` with filters (entityType, entityId, action, date range, userId, search, pagination)
- [x] CSV export endpoint: `GET /api/companies/:companyId/audit-logs/export`
- [x] Unified audit log UI page with filters, expandable field diffs, CSV export, and pagination
- [x] Source document linking for traceability

### File Storage
- [x] Cloudflare R2 integration — `R2Service` and `R2Module` with upload, presigned URL, delete
- [x] Attachments upload with `memoryStorage()` + R2 (25MB limit)
- [x] Receipt upload endpoint: `POST /companies/:companyId/ap/receipts/upload`
- [x] Presigned URL generation: `GET /api/attachments/:id/url`
- [x] R2 VPS deployment validated — uploads, presigned URLs, and receipt endpoint confirmed working in production
- [x] workspaceId foreign key bug fixed (companyId → company.workspaceId lookup)
- [x] forcePathStyle added for Cloudflare R2 signature compatibility

### Landing Page & Pricing
- [x] All country-specific references removed — landing and pricing pages are now fully international/country-agnostic
- [x] "About HaypBooks" story section added to landing page (between How It Works and Testimonials)
- [x] Pricing centralized in `src/lib/pricing.ts` — single source of truth consumed by landing page preview and pricing page
- [x] Compact pricing preview component added to landing page
- [x] Pricing page FAQ updated with generic tax compliance and payment method wording

### Authentication & Onboarding
- [x] Email verification flow
- [x] Onboarding with company creation
- [x] JWT-based authentication (CSRF-immune)
- [x] Cross-subdomain CSRF protection for cookie-based requests

---

## Next Sprint

> Two parallel active tracks are in progress: Practice Hub MVP and Owner Dashboard implementation.

### Plan F: Owner Dashboard — Platform Monitoring & Usage Limits
**Status**: 🔄 Active Implementation — 12 of 13 todos complete (only platform-wide metrics remaining)

Build the HB_Owner-only dashboard — the master control panel for the HaypBooks platform owner (JP). Only the platform owner can see and access this dashboard. Regular subscribers cannot see it.

#### Progress Tracker
| # | Todo | Status |
|---|------|--------|
| 0 | Owner-only 3-way navigation (frontend visibility) | ✅ Complete |
| 1 | Backend Owner module (controller/service/module) | ✅ Complete |
| 2 | StorageLimit Prisma model + migration | ✅ Complete |
| 3 | GET /api/owner/storage/usage (platform-wide aggregate) | ✅ Complete |
| 4 | GET /api/owner/storage/usage/:companyId (per-company detail) | ✅ Complete |
| 5 | R2Service.getFolderSize() (R2 folder size helper) | ✅ Complete |
| 6 | PUT /api/owner/storage/limits/:companyId (override endpoint) | ✅ Complete |
| 7 | Owner Dashboard storage overview UI | ✅ Complete |
| 8 | Per-company custom limit controls UI | ✅ Complete |
| 9 | User management list (pagination, search, filters) | ✅ Complete |
| 10 | Suspend/reactivate user controls + backend endpoint | ✅ Complete |
| 11 | Audit logging for storage overrides | ✅ Complete (integrated into todo 6) |
| 12 | Platform-wide metrics and plan distribution | ⬜ Pending |

#### Storage System with 50GB Safety Net
- Every user on any subscription plan automatically receives a **50GB safety net buffer** beyond their plan's allocated storage
- Storage limits are enforced at upload time — reject uploads when the combined plan allocation + safety net is exceeded, with a clear error message
- The platform owner can **override and increase** any user's storage limit from the Owner Dashboard at any time — no contact/request needed from the user
- Owner can also **reduce** limits back to plan defaults if needed
- Display per-company storage metrics:
  - Database storage used (PostgreSQL table sizes per company/schema)
  - R2 storage used (Cloudflare R2 bucket usage per company folder prefix)
  - Total storage per company with visual bar/donut chart
  - Usage percentage, remaining storage, and plan vs. safety net breakdown on each company card

#### Owner-Only Navigation (3-Way vs 2-Way)
- **Platform owner (JP)** sees **3 selections** after login:
  1. HaypBooks Company Dashboard (My Companies)
  2. HaypBooks Practice Hub (My Practice)
  3. HaypBooks Owner Dashboard (HB_Owner — master control panel)
- **Regular subscribers** see only **2 selections** after login:
  1. HaypBooks Company Dashboard (My Companies)
  2. HaypBooks Practice Hub (My Practice)
  - The Owner Dashboard selection is **completely hidden** from non-owner users
- The Owner Dashboard is gated by the existing `RolesGuard` with `@Roles('Owner')` — no new guard needed

#### User Management & Monitoring
- List all users across HaypBooks with pagination and search
- Show user status (active/suspended), last login, company affiliation, plan type, storage usage
- Ability to suspend/reactivate users (with audit log entry)
- Per-user storage override controls — owner can set custom limits for any user

#### Platform-Wide Metrics
- Total companies, total users, total storage consumed
- Storage growth trend over time (daily/weekly/monthly)
- Plan distribution overview (how many users on each plan)

#### Backend Endpoints
- `GET /api/owner/storage/usage` — aggregate platform-wide storage metrics ✅
- `GET /api/owner/storage/usage/:companyId` — per-company storage breakdown ✅
- `PUT /api/owner/storage/limits/:companyId` — set/override storage limits per company ✅
- `GET /api/owner/users` — list all users with pagination, search, and filters ✅
- `PATCH /api/owner/users/:userId/status` — suspend/reactivate user (with audit log) ✅

### Practice Hub MVP
**Status**: 🔄 Active Implementation — 3 of 5 todos complete

Build the client management platform for accounting firms — enabling multi-client bookkeeping from a single dashboard.

#### Progress Tracker
| # | Todo | Status |
|---|------|--------|
| 1 | Practice Hub infrastructure (sidebar, layout, nav config, page template, route group) | ✅ Complete |
| 2 | Practice dashboard page (stat cards, activity feed, deadlines, client preview) | ✅ Complete |
| 3 | Client list page with search and pagination | ✅ Complete |
| 4 | Multi-client workspace switching | ⬜ Pending |
| 5 | Client onboarding workflow | ⬜ Pending |

**Expected output:** Accounting firms can manage multiple client books from a single dashboard with quick-switch between entities.

---

## Future Plans

### Plan A: Self-Hosted PostgreSQL Migration
- Migrate from Supabase hosted PostgreSQL to self-hosted PostgreSQL on the VPS or a separate DB server
- Eliminates Supabase dependency, reduces costs, gives full control over backups and scaling
- **Blocked by:** E2E testing completion

### Plan B: Multi-Currency Support
- Add currency fields to company settings, invoices, bills
- Implement exchange rate management (manual and auto-fetch)
- Convert financial statements to support multi-currency display
- **Blocked by:** Priority 2 (Practice Hub MVP) completion

### Plan C: Budgeting Module
- Create budget templates by account and period
- Budget vs Actual comparison in financial statements
- Budget variance alerts and reporting
- **Blocked by:** Financial statement production validation

### Plan D: Approval Workflows
- Implement role-based access control (RBAC) for accounting functions
- Create approval chains for journal entries above a threshold amount
- Add manager approval for bank reconciliation completion
- **Blocked by:** Priority 2 (Practice Hub MVP) completion

### Plan E: Fixed Asset Management
- Asset register with depreciation schedules (straight-line, declining balance)
- Automatic depreciation journal entries
- Asset disposal and revaluation workflows
- **Blocked by:** Core accounting E2E validation

---

## Deferred Backend Stubs (22 Total)

These modules have controller/service stubs that return placeholder data. They require full backend implementation before the frontend can be connected.

### Inventory Module (6 stubs)
- Inventory items CRUD, stock adjustments, inventory valuation, warehouse management, stock movements, inventory reports

### Payroll Module (6 stubs)
- Employee records, payroll runs, tax computations, payslip generation, payroll reports, statutory contributions

### Projects Module (6 stubs)
- Project creation, time tracking, project billing, project profitability, milestone tracking, project reports

### Other (4 stubs)
- Fixed asset insurance tracking, accounting period close sign-offs, advanced reporting, data import/export

**Note:** These are low priority. They should be addressed individually when the corresponding frontend module becomes the development focus.

---

## Technical Debt

- [ ] Nginx reverse proxy passes `localhost` as hostname to Next.js (workaround applied in verification page)
- [ ] `NEXTAUTH_URL` must be explicitly set in production (documented in deployment guide)
- [ ] No automated test suite exists — all testing is currently manual
