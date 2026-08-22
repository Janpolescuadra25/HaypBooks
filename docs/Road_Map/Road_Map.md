# HaypBooks — Development Roadmap

> Last updated: August 19, 2026

## Completed Projects
- ✅ **Memory Leak Fix** — Resolved unbounded metrics accumulation in `Backend/src/common/metrics.ts` with hourly `counts.clear()` + PM2 `max_memory_restart 1G` mitigation
- ✅ **Slow Currency Endpoint Fix** — Fixed `GET /api/currency/currencies` latency with 1-hour TTL in-memory cache in `exchange-rate.service.ts:82-88`
- ✅ **Fix 401 on Dashboard (Auth Cookie Routing)** — Changed `NEXT_PUBLIC_API_URL` from `https://api.haypbooks.com` to empty string in `.env.production` on VPS so axios requests stay same-origin through nginx proxy.
- ✅ **Fix 403 on Dashboard (RolesGuard)** — Updated `Backend/src/auth/guards/roles.guard.ts` line 33 to treat `role='business'` as equivalent to `'owner'` (case-insensitive + business→owner mapping). Committed to git and deployed to VPS.
- ✅ **Fix Undeposited Funds Account Code Mismatch** — Replaced hardcoded `'1050'` in `Backend/src/shared/sub-ledger.service.ts` with `SYSTEM_ACCOUNTS.UNDEPOSITED_FUNDS.code` for `postBankDepositToGL`. This fixes bank deposit GL posting by using the current COA code `'1170'` instead of the legacy, missing `'1050'` account.
- ✅ **Fix Void/Reversal JE Dating** — All void/reversal methods (createReversingJE + 8 callers, reverseInvoiceGL, reversePaymentReceivedGL, reverseCreditNoteGL, reverseWriteOffGL, reverseRefundGL, reverseRevenueRecognitionGL, voidJournalEntry) now use the original entry's date instead of `new Date()`, preventing accounting period corruption. Voids in closed periods now correctly fail.
- ✅ **Fix voidDeposit Missing GL Reversal** — Added `createReversingJE` call to `voidDeposit` in `banking.repository.ts`, creating a proper GL reversal JE when a bank deposit is voided. Previously the original deposit JE remained posted, permanently overstating cash and understating undeposited funds.
- ✅ **Fix DB Connection Limit** — Added `&connection_limit=10` to DATABASE_URL in `Backend/.env` on VPS.
- ✅ **Fix CORS on api.haypbooks.com** — Added port 80 proxy block in nginx for `api.haypbooks.com`.
- ✅ **Onboarding Re-Trigger Fix** — Fixed: added `getOnboardingStatus()` helper in `prisma-auth.service.ts` (L100-111) that queries `OnboardingData.complete` instead of non-existent `user.onboardingComplete` field. All 4 auth response locations (signup L54, login L184, createSessionForUser L255, refresh L318) updated. Build passes. ✅ Deployed to VPS (committed in `c238607f`, auto-deployed via GitHub Actions).
- ✅ **Dashboard Banner Bug Fix** — Resolved stale error state in `useCompanyId()` hook and fixed `OwnerDashboard.tsx` condition that incorrectly showed "No company linked" banner despite valid API responses
- ✅ **Onboarding Transaction Timeout Fix** — Moved COA seeding outside the onboarding Prisma interactive transaction and replaced 40+ sequential `account.create()` calls with a single batched `createMany()` operation. Transaction duration reduced from 60+ seconds to under 2 seconds, resolving the production onboarding blocker.
- ✅ **PDFKit Build Fix** — Added missing `@types/pdfkit` dev dependency to package.json, resolving VPS build error TS2307: Cannot find module 'pdfkit'.
- ✅ **VPS Auto-Deploy Pipeline** — GitHub Actions → SSH → deploy.sh → PM2 restart. Fully operational. Every push to main auto-deploys to production.
- ✅ **Logo Replacement** — All placeholder logos replaced with HB_Logo.png. Favicon and metadata configured.
- ✅ **Repo Cleanup** — Removed stray root files, malformed filenames, and all "open source" references. HaypBooks is proprietary.
- ✅ **Build Error Fixes** — Resolved TypeScript/Prisma build errors in owner.service.ts.
- ✅ **Multi-Currency Support (Plan B)** — Full end-to-end multi-currency accounting: Currency/ExchangeRate models with 15 seeded currencies, ExchangeRateService with enforceCurrency() helper and live API rate fetching, currency enforcement in transaction services, shared formatCurrency() utility, company base currency selector, multi-currency financial reporting with display currency selector on P&L/Balance Sheet/Cash Flow/Trial Balance.
- ✅ **Zypra AI Assistant (Plan F, Phase 1)** — Floating chat widget with Gemini-powered accounting Q&A, lazy initialization, quick actions, system prompt guardrails.
- ✅ **Cinematic Intro Restoration** — Reverted intro animation from HB logo back to "Haypbooks" text via git history.
- ✅ **Owner Module DI Fix** — Added CompaniesModule to OwnerModule imports, resolving 478-restart crash loop in production.

---

## In Progress

### P0: Critical Production Fixes
- ~~**Fix JWT Payload**~~ ✅ Fixed: added `systemRole` and `isOwner` to JWT payload at all 4 sign locations in `prisma-auth.service.ts`. Added `getIsOwner()` helper querying `Workspace.ownerUserId`. Updated `jwt.strategy.ts` validate() return. Added `systemRole` to User interface.
- ~~**Fix `mapRoleForFrontend` Inconsistency**~~ ✅ NOT A BUG — Three orthogonal role layers confirmed: hub role (JWT `role` → `'business'`/`'accountant'`), RBAC role (cookie `role` → `'admin'`/`'manager'`/`'viewer'`), platform role (JWT `systemRole` → `'USER'`/`'SUPER_ADMIN'`). The `mapRoleForFrontend` function correctly maps workspace owners to `'admin'` RBAC permissions. Renaming deferred to Plan H. Documented in `docs/architecture/ROLE_SYSTEM.md`.
- ✅ **Hub Selection Screen Redesign** — Fixed: Added `isHubSelection` check to `client-root.tsx` (L102, L119) to exclude `/workspace` from the OwnerTopBar + OwnerSidebar layout. The hub selection page now renders as a clean full-page experience. The existing WorkspacePage component already had all three panels (Companies list, Practice list, Owner Dashboard button). No git history revert needed.

### Plan C Phase 3: Budgeting Module Enhancements
**Status**: Not Started | **Depends on**: Plan C Phase 2 (fully completed and deployed)

**Goal**: Extend the budgeting module with templates, alerts, exports, and forecasting capabilities.

**What needs to be achieved**:
- **Budget Templates**: Pre-built budget templates for common industries (retail, SaaS, professional services, manufacturing) that auto-populate account lines with realistic defaults based on chart of accounts structure
- **Variance Alerts**: Automated notifications (in-app first, email later) when actual spending exceeds budgeted amounts by a configurable threshold (e.g., 10%, 20%, 50%) — alert rules stored in database with per-company customization
- ~~**CSV/PDF Export**: Export budget vs actual reports to CSV (with proper number formatting and column headers) and PDF (styled to match the existing financial report layout) from the vs-actual page~~ — COMPLETED: CSV/PDF budget exports are fully functional and deployed.
- **Rolling Forecasts**: Ability to update budget amounts mid-fiscal-year and compare original budget vs. revised forecast vs. actuals — requires a `scenario` field extension (DRAFT, ORIGINAL, REVISED, FORECAST)
- **Cash Flow Integration**: Link budget data to cash flow forecasting so projected cash positions account for budgeted income and expenses by month
- **Budget Ownership & Comments**: Assign budget line ownership to team members and add comment threads on individual budget lines for collaboration during budget review cycles

---

## Priority Backlog

### P1: High Priority
- **Separate OwnerController Endpoints** — Move company-level endpoints (`financial-summary`, `cash-position`, `dashboard`) out of `OwnerController` to `CompanyController`. Keep `OwnerController` for platform-level endpoints only (storage, users, metrics) guarded with `@Roles('SUPER_ADMIN')` or `@Roles('ADMIN', 'SUPER_ADMIN')`. File: `Backend/src/owner/owner.controller.ts`
- **Set Cookie Domain for Cross-Subdomain Support** — `Backend/src/auth/auth.controller.ts:80-84` cookie options: add `domain: '.haypbooks.com'` and change `sameSite: 'lax'` to `sameSite: 'none'` (with `secure: true`). ⚠️ Security-impacting change — verify CSRF protection still works after this. Test login/logout/refresh flows on both `haypbooks.com` and `api.haypbooks.com`.
- **Add `credentials: 'include'` to All fetch() Calls** — 21 of 25 raw `fetch()` calls in the frontend don't set `credentials`. Files: `useCompanyId.ts`, `CompanySwitcher.tsx`, `HubSelectionModal.tsx`, `HubSwitcher.tsx`, `CompanyHub.tsx`, `AppShellHeader.tsx`, `PracticeHeader.tsx`, `SetupCenter.tsx`, `AddCompanyModal.tsx`, `AddPracticeModal.tsx`, `InvoiceCreatePage.tsx`, `CompanyModal.tsx`, `BusinessHealthClient.tsx`, payroll page, accounting-preferences page, accept-invite page, onboarding page, get-started pages, subscribe page, `lib/analytics.ts`.
- **Consolidate API Clients** — Replace raw `fetch()` calls with the axios `apiClient` instance (has interceptors, error handling, `withCredentials`). Or create a shared `fetchWithAuth()` wrapper in `Frontend/src/lib/api.ts`.
- **Fix `lib/api.ts` Fetch Wrapper** — `Frontend/src/lib/api.ts:13` is bare `fetch()` with no credentials, no auth, no interceptors. Add `credentials: 'include'` and Authorization header support.
- **ClientRoot UI Fix** — Nav leak on `/workspace` fixed via `isHubSelection` check (see Hub Selection above). Remaining: `useCompanyId()` hook for conditionally rendering minimal layout when no company is selected is still open — separate concern.
- **Owner Dashboard Distinct Layout** — Currently `/owner/*` routes share the same `OwnerTopBar + OwnerSidebar` chrome as company admin routes (`client-root.tsx` L120-129). The platform owner dashboard must have its OWN separate layout component (e.g., `PlatformTopBar` + `PlatformSidebar`) with platform-level navigation items. In `client-root.tsx`, add `isOwnerRoute = pathname.startsWith('/owner')` and render the platform layout instead of the company admin layout for owner routes. The owner dashboard is NOT a company admin view — it's the master control panel for the entire HaypBooks platform.

### P2: Medium Priority
- **Fix Phantom `role` Field** — `Backend/src/repositories/interfaces/user.repository.interface.ts:8` declares 8 role values (`'owner' | 'admin' | 'manager' | 'ar-clerk' | 'ap-clerk' | 'viewer' | 'accountant' | 'both'`) but DB has no `role` column — Prisma maps `systemRole` to `@map("role")`. Repository synthesizes `role` from `preferredHub` producing only `'business'` or `'accountant'`. Clean up the interface to match reality.
- **Build Platform Owner Dashboard** — Separate UI for `SUPER_ADMIN` users (JP) to access platform endpoints: all users, storage usage, metrics, plan distribution. Current `OwnerDashboard` is for company admins, not platform owners. Backend endpoints already exist (`/api/owner/users`, `/api/owner/storage/usage`, `/api/owner/metrics/*`). Full platform owner dashboard with dedicated layout (see P1: Owner Dashboard Distinct Layout). The owner is the HaypBooks platform master — this dashboard monitors and controls everything across all companies and practices. Required navigation sections:

  **1. 📊 Overview** — Platform KPIs at a glance: total companies, practices, users; subscription health (active/trial/expired); revenue metrics; recent signups; system health indicators.

  **2. 🏢 Companies** — All companies on the platform. Table: name, owner, plan, status (active/trial/expired/suspended), user count, storage usage, created date. Actions: view details, suspend, activate. Search and filter by plan/status.

  **3. 📑 Practices** — All accounting practices. Table: practice name, accountant, plan, status, linked companies count, created date. Actions: view details, suspend, activate. Search and filter.

  **4. 👥 Users** — Platform-wide user management. Table: name, email, role, company/practice, status, last login. Actions: view, delete (with file cleanup — see P2: User Account Deletion). Search and filter by role/status/company.

  **5. 💳 Subscriptions** — Subscription health and management. Overview cards: MRR, active count, churn rate. Subscription list with plan details and status. Expiring soon alerts. Plan definitions if dynamic pricing is implemented.

  **6. 📁 Storage** — Platform storage monitoring. Total usage, per-company breakdown, file type distribution, cleanup tools. Identify storage-heavy tenants.

  **7. 📋 Audit Log** — Platform activity tracking. Table: timestamp, user, action, entity, details. Filters: by user, action type, date range, entity. Login history.

  **8. ⚙️ Platform Settings** — Global configuration. Feature flags, email templates, maintenance mode toggle, default subscription plans, platform branding.

  **9. 🩺 System Health** — Infrastructure monitoring. CPU, RAM, disk usage; API error rates; database size; active sessions; uptime.
- **Build Practice Dashboard** — Accountant workspace dashboard, separate from company dashboard.
- **Three-Role Architecture** — Proper separation of: (1) Platform Owner (`SUPER_ADMIN` — manages the SaaS platform), (2) Company Admin (`business` / `preferredHub: OWNER` — manages their company), (3) Practice Admin (`accountant` / `preferredHub: ACCOUNTANT` — manages their practice). Each needs its own dashboard, routing guard, and API scope.
- **Remove Stale Hardcoded Demo Data** — `Frontend/src/components/HubSidebar.tsx:54` has `juan@haypbooks.com` and `Frontend/src/components/TopBar.tsx:173` has `demo@haypbooks.com`. Replace with dynamic user data from `useUser()`.
- **Reduce `--max-old-space-size`** — Currently 4096MB in `ecosystem.config.js`, should be 512-1024MB for a CX33 (4GB RAM VPS).
- **Add Porkbun Domain Info to README** — Domain `haypbooks.com` purchased on Porkbun, DNS via Cloudflare.
- **Verify Memory Leak Fix** — Monitor `haypbooks-backend` memory over 24-48hrs to confirm `metrics.ts` hourly `counts.clear()` resolves the issue long-term.
- **User Account Deletion with File Cleanup** — Owner/Admin can permanently delete a user account. When a user is deleted, all their associated files (uploaded documents, attachments, exported reports) are also permanently deleted from storage. Requires cascade delete logic across User → WorkspaceUser → Company memberships, and a file cleanup service that removes the user's files from storage.

---

## Future Plans

| Plan | Name | Status | Blocked By |
|------|------|--------|------------|
| A | Self-Hosted PostgreSQL Migration | Not Started | E2E testing completion |
| D | Approval Workflows | Not Started | — |
| E | Fixed Asset Management | Not Started | Core accounting E2E validation |
| F-2 | Zypra AI Phase 2 (Persistent History, Document Q&A, Advanced Insights) | Not Started | — |
| G | Comprehensive Product Maturity Audit & Polish | Not Started | All P0 items resolved |
| H | Three-Role Architecture Refactor | Not Started | P0 items + Plan G completion |

### Plan A: Self-Hosted PostgreSQL Migration
**Goal**: Migrate from Supabase hosted PostgreSQL to a self-hosted PostgreSQL instance on the VPS or a dedicated database server.

**What needs to be achieved**:
- Install and configure PostgreSQL on the VPS (or a separate DB server) with production-grade settings (shared_buffers, work_mem, connection pooling via PgBouncer)
- Set up automated backup with pg_dump cron jobs (daily full, hourly WAL archiving) and verified restore procedures
- Migrate all existing data from Supabase using `pg_dump`/`pg_restore` with zero-downtime cutover (dual-write or DNS switchover)
- Update all environment variables (DATABASE_URL) and verify Prisma migrations apply cleanly against the new instance
- Configure firewall rules so only the VPS (and local dev) can reach PostgreSQL port 5432
- **Blocked by:** E2E testing completion — we need confidence that the data layer works correctly before migrating to self-hosted

### Plan D: Approval Workflows
**Goal**: Provide controlled approval flows for high-risk accounting actions to enforce internal controls and audit compliance.

**What needs to be achieved**:
- Implement role-based approval matrix: define which roles can approve which action types (journal entries, bank reconciliations, payments above threshold)
- Create an `Approval` model with states (PENDING, APPROVED, REJECTED, CANCELLED) and approval chains supporting single-approver and multi-level sequential approval
- Add approval requirement to journal entry creation when the entry total exceeds a configurable company-level threshold
- Add manager sign-off step to bank reconciliation completion — reconciliation cannot be finalized until an approver reviews and approves
- Build an approvals dashboard listing pending items for the current user with one-click approve/reject actions and comment/reason fields
- Emit audit log entries for every approval action (who approved, when, reason, linked record)

### Plan E: Fixed Asset Management
**Goal**: Add fixed asset tracking, depreciation scheduling, and disposal/revaluation workflows for long-term asset accounting.

**What needs to be achieved**:
- Create FixedAsset model with fields: name, description, purchaseDate, purchasePrice, salvageValue, usefulLifeYears, depreciationMethod (STRAIGHT_LINE, DECLINING_BALANCE), currentBookValue, status (ACTIVE, DISPOSED, UNDER_REVIEW)
- Build asset register page with CRUD, filtering by department/category/status, and summary cards showing total asset value and accumulated depreciation
- Implement depreciation calculation engine supporting straight-line and declining balance methods with monthly depreciation journal entries auto-generated on schedule
- Create asset disposal workflow: mark asset as disposed, record disposal date/proceeds/loss-or-gain, generate disposal journal entry
- Add asset revaluation workflow: record new fair value, generate revaluation surplus/impairment journal entry
- **Blocked by:** Core accounting E2E validation — need verified journal entry and financial statement accuracy before generating automated depreciation entries

### Plan F-2: Zypra AI Phase 2
**Goal**: Evolve Zypra from a simple Q&A widget into a persistent, context-aware accounting assistant.

**What needs to be achieved**:
- Persistent conversation history stored in database (linked to userId and companyId) so users can reference previous questions
- Document Q&A: upload invoices, bank statements, or receipts and have Zypra extract and answer questions about the document content
- Advanced insights: Zypra proactively identifies anomalies (unusual expenses, missing reconciliations, late payments) and surfaces them in the chat
- Context-aware responses: Zypra knows which company the user is viewing and filters all responses to that company's data
- Quick action execution: users can ask Zypra to perform actions ("create a journal entry for $500 rent expense") with confirmation prompts

---

### Plan G: Comprehensive Product Maturity Audit & Polish
**Status**: Not Started | **Depends on**: Memory leak resolved, all critical bugs fixed
**What needs to be achieved**:

A full multi-perspective audit of the entire HaypBooks application to bring it from MVP to production-grade quality. Each phase produces a detailed findings report and a prioritized list of Mantra-executable fixes.

#### Phase 0: Production Stability (P0 — must complete before any other phase)
**Goal:** Eliminate all P0 production stability risks that cause downtime or data loss.
- [x] Memory leak investigation and fix (see Technical Debt section above)
- [x] Slow `/api/currency/currencies` endpoint (5+ second response time)
- [x] `bot-connect.js` 404 errors in frontend logs — Resolved (no references found in Frontend codebase)
- [x] Verify onboarding re-trigger bug is resolved — Fixed via `getOnboardingStatus()` in `prisma-auth.service.ts`

#### Phase 1: Accounting Flow & Logic Audit (Accountant Perspective)
**Goal:** Establish codebase health baseline with testing, monitoring, and dependency cleanup.
- Audit every data entry flow (invoices, bills, journal entries, payments, receipts) for logical correctness from a CPA's perspective
- Verify chart of accounts structure, double-entry enforcement, debit/credit logic, and trial balance accuracy
- Compare navigation and workflow against QuickBooks Online, Xero, and ERPNext
- Assess whether every button, label, and action is in the right place for daily accounting work
- Verify all financial reports (Income Statement, Balance Sheet, Cash Flow, Trial Balance) produce correct outputs
- Check that general ledger entries are complete and accurate for every transaction type

#### Phase 2: UI/UX Consistency & Design Audit (UI Designer + Frontend Engineer Perspective)
**Goal:** Polish user-facing experience with better loading states, error messages, and report performance.
- Audit every page for visual consistency: spacing, typography, colors, button styles, card layouts
- Identify and eliminate redundant buttons, duplicate forms, or inconsistent patterns across pages
- Review all reusable/shared components for consistency and proper abstraction
- Verify responsive design across desktop, tablet, and mobile viewports
- Audit empty states, loading states, and error states on every page
- Ensure navigation structure is logical and grouped by function (not a flat 16+ item list)
- Compare visual clarity and usability against QuickBooks, Xero, and modern SaaS accounting tools

#### Phase 3: Backend Architecture & API Audit (Backend Engineer Perspective)
**Goal:** Complete all in-progress features (budgeting enhancements, budget templates).
- Audit all API endpoints for proper error handling, validation, and consistent response formats
- Review database queries for N+1 issues, missing indexes, and performance bottlenecks
- Verify multi-tenant isolation (workspace/company data separation) across all endpoints
- Audit Prisma schema for missing relations, orphaned models, or incorrect types
- Review authentication and authorization guards on every protected route
- Assess API versioning strategy and backward compatibility

#### Phase 4: Security & Compliance Audit (Security Analyst + Auditor Perspective)
**Goal:** Secure sensitive financial data with encryption, audit trails, and access control.
- Audit authentication flow (JWT, session management, password policies)
- Review authorization checks (CompanyAccessGuard, role-based access) for bypasses
- Check for sensitive data exposure in API responses (passwords, internal IDs, system fields)
- Verify CORS configuration, rate limiting, and input sanitization
- Audit the audit trail system for completeness and tamper-resistance
- Assess compliance readiness for basic accounting standards (data retention, audit logs)

#### Phase 5: Business Logic & Financial Analysis Audit (Financial Analyst + Business Analyst Perspective)
**Goal:** Optimize application performance for scale and reduce frontend bundle size.
- Audit dashboard KPIs for accuracy and relevance to business decision-making
- Verify budget vs actual variance calculations and alerting thresholds
- Review multi-currency handling for correct exchange rate application
- Assess the quality and actionability of financial reports
- Identify missing features that would provide strategic value (forecasting, ratio analysis, trends)

#### Phase 6: Folder Structure & Code Organization Audit
**Goal:** Prepare production environment for public launch with monitoring and documentation.
- Review frontend and backend directory structures for logical grouping
- Identify misplaced files, unused imports, dead code
- Verify module boundaries in NestJS (proper module encapsulation)
- Assess test coverage and identify critical untested paths

**Execution approach**: Each phase should be executed as a separate Hydra audit prompt, followed by Mantra execution prompts for each batch of fixes. Phases can be partially parallelized (1-2 first, then 3-4, then 5-6).

---

### Plan H: Three-Role Architecture Refactor

**Goal:** Fully separate three admin roles — Owner Admin (platform owner), Company Admin (business user), and Practice Admin (accountant) — with isolated dashboards, navigation, API endpoints, subscription enforcement, and database isolation.

**Status:** Not Started
**Blocked By:** P0 items (JWT payload fix, onboarding regression), Plan G completion
**Priority:** HIGH — foundation for all future feature development

**Context:** Currently the codebase has NO three-role separation. Only two effective roles exist (`business` and `accountant` synthesized from `preferredHub`). `SUPER_ADMIN` exists in the enum and has a seed script (`prisma/seed-admin.ts`) but is never used for access control — not in JWT, not in guards. Platform owner features (storage, metrics, user management) are visible to all Company Admin users in the sidebar. No subscription plan capacities are enforced.

---

#### Phase H-0: Foundation — JWT + Auth Chain Fix
**Prerequisite:** Must complete BEFORE any other Phase H work.
**Depends on:** P0 items (JWT payload, mapRoleForFrontend)

- [x] Add `systemRole` and `isOwner` to JWT payload — done in prisma-auth.service.ts + jwt.strategy.ts
- [x] Add `isOwner` to JWT payload — done (L52, L194, L258, L332 in `prisma-auth.service.ts`)
- [x] Update `jwt.strategy.ts:28-32` validate() to return `systemRole` and isOwner — done (L32-33)
- [x] Update `RolesGuard` to check `systemRole === 'SUPER_ADMIN'` for platform endpoints
- [x] Standardize role values — NOT A BUG (three orthogonal layers, see docs/architecture/ROLE_SYSTEM.md). Renaming deferred to Phase H-1.
- [ ] Run `seed-admin.ts` on VPS with `ADMIN_EMAIL=paulescuadra25@gmail.com` to create the Owner Admin account
- [ ] Add `ADMIN_EMAIL` and `ADMIN_DEFAULT_PASSWORD` to VPS `.env`
- [ ] Verify SUPER_ADMIN can log in and JWT contains `systemRole: 'SUPER_ADMIN'`

#### Phase H-1: Backend Role Separation
**Depends on:** Phase H-0

- [ ] Split `OwnerController` — move company-level endpoints to `CompanyController` (deferred to H-2, when frontend routes are updated simultaneously; guard-level separation done in this phase)
- [x] Update `OwnerController` to use `@SystemRoles('SUPER_ADMIN')` (via new SystemRoleGuard) for platform endpoints: storage, users, metrics
- [ ] Enhance existing `PracticeController` (`Backend/src/practice/practice.controller.ts`) and `PracticeHubController` (`Backend/src/practice-hub/practice-hub.controller.ts`) with additional practice-specific endpoints as needed
- [x] Add `systemRole`-based guard: new `SystemRoleGuard` that checks `req.user.systemRole` instead of workspace role
- [ ] Prevent cross-role creation: Company Admin should NOT be able to create Practice entities, and vice versa
- [ ] Onboarding separation: change `OnboardingData` from per-user to per-(user, hubType) to support separate company and practice onboarding

#### Phase H-2: Frontend Navigation Isolation
**Depends on:** Phase H-1

- [ ] Remove 3 leaked nav sections from Company Admin sidebar (`ownerNavConfig.ts`): STORAGE → `/owner/storage`, METRICS → `/owner/metrics`, USERS → `/owner/users` — show these ONLY when `systemRole === 'SUPER_ADMIN'`
- [ ] Remove COLLABORATION → Client Requests from Company Admin nav (practice-only feature)
- [ ] Create separate nav configs: `companyAdminNavConfig.ts`, `ownerAdminNavConfig.ts`, `practiceAdminNavConfig.ts`
- [ ] Route group separation: move platform admin pages out of `app/(owner)/owner/` into `app/(platform-admin)/`
- [ ] Add routing guard: middleware or component that checks `systemRole` and redirects unauthorized role access
- [ ] WorkspacePage: fix "Owner Dashboard" card that links to `/owner/storage` — should only show for SUPER_ADMIN

#### Phase H-3: Owner Admin Dashboard
**Depends on:** Phase H-1, H-2

- [ ] Build Platform Owner Dashboard component (overview: total companies, users, revenue, storage, growth charts)
- [ ] Build Storage Management page (per-company storage, limits, R2 usage)
- [ ] Build User Management page (all users, suspend/reactivate, view sessions, role assignment)
- [ ] Build Platform Metrics page (plan distribution, growth history, snapshots, MRR)
- [ ] Build Subscription Overview page (all active subscriptions, revenue, churn)
- [ ] Build Platform Settings page (global config, feature flags per workspace)
- [ ] Owner Admin should see all three dashboards (Platform + Company + Practice) via a dashboard switcher
- [ ] Owner Admin has NO subscription plan — unlimited access, no capacity restrictions

#### Phase H-4: Subscription Enforcement
**Depends on:** Phase H-1

- [ ] Create `SubscriptionGuard` — checks plan capacity before allowing company/client creation
- [ ] Enforce `Plan.maxCompanies` — block company creation when at capacity
- [ ] Enforce `Plan.maxClients` — block client acceptance when at capacity
- [ ] Create subscription status check middleware — block access when subscription is `PAST_DUE`, `CANCELED`, or `EXPIRED`
- [ ] Build subscription limit UI — show current usage vs plan limits in settings
- [ ] Upgrade/paywall flow — prompt users to upgrade when hitting limits
- [ ] Seed plan records (FREE, STARTER, PRO, ENTERPRISE or equivalent) — currently no plans exist in DB

#### Phase H-5: Practice Admin Enhancement
**Depends on:** Phase H-1, H-2

- [ ] Expand practice nav from 2 sections to: Dashboard, Clients, Team, Settings, Billing, Reports
- [ ] Implement Practice XP/tier gamification system (schema fields `practiceTier`/`practiceXp` exist but are never read/written)
- [ ] Practice subscription plans with capacity limits (clients per tier)
- [ ] Practice Admin should see only Practice Dashboard (not Company Dashboard)
- [ ] Subscription-plan users should only see two workspace options at creation: Company or Practice (not both unless allowed by plan)

#### Phase H-6: Database & Schema Cleanup
**Depends on:** All previous phases

- [ ] Fix phantom `role` field in `User` interface — update `user.repository.interface.ts:8` to match reality (only `'business'` or `'accountant'` can be returned)
- [ ] Consider renaming `preferredHub` values (`OWNER` → `COMPANY`) to eliminate confusion between "workspace owner" and "platform owner"
- [ ] Clean up `WorkspaceType` enum usage — ensure Practice creation explicitly sets `type = PRACTICE`
- [ ] Verify `practiceId` on `AuditLog` is populated for practice-scoped actions (field exists at `schema.prisma:9824` but may not be written consistently)
- [ ] Include `seed-admin.ts` in the default deploy pipeline or document manual step

---

**Known Issues to Track:**
- 🔴 3 platform nav sections (STORAGE, METRICS, USERS) visible to all Company Admin users
- ✅ 3 company-level API endpoints trapped behind wrong guard in OwnerController
- 🔴 No subscription capacity enforcement anywhere
- 🔴 Practice XP/tier system is dead schema (fields exist, no code)
- 🟡 COLLABORATION section (Client Requests) visible to Company Admins
- 🟡 Cross-role creation allowed (Company Admin can create Practice)
- 🟡 WorkspacePage shows platform admin link to any workspace owner

---

## Deferred Backend Stubs (22 Total)

These modules have controller/service stubs that return placeholder data. They require full backend implementation before the frontend can be connected.

### Inventory Module (6 stubs)
- Inventory items CRUD, stock adjustments, inventory valuation, warehouse management, stock movements, inventory reports

### Payroll Module (6 stubs)
- Employee records, payroll runs, tax computations, payslip generation, statutory contributions, payslip generation

### Projects Module (6 stubs)
- Project creation, time tracking, project billing, project profitability, milestone tracking, project reports

### Other (4 stubs)
- Fixed asset insurance tracking, accounting period close sign-offs, advanced reporting, data import/export

**Note:** These are low priority. Address individually when the corresponding frontend module becomes the development focus.

---

## Technical Debt
- [ ] No automated test suite exists — all testing is currently manual
- Resolved — see Completed Projects. Fix: hourly counts.clear() in metrics.ts + PM2 max_memory_restart 1G.
- [x] **`bot-connect.js` 404 errors** — Resolved. No references to `bot-connect.js` found in Frontend codebase.
