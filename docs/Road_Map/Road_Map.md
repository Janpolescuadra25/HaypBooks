# HaypBooks â€” Development Roadmap

> Last updated: August 29, 2026

## Completed Projects
<details>
<summary>Archived completed projects (older)</summary>

- âœ… **Memory Leak Fix** â€” Resolved unbounded metrics accumulation in `Backend/src/common/metrics.ts` with hourly `counts.clear()` + PM2 `max_memory_restart 1G` mitigation
- âœ… **Slow Currency Endpoint Fix** â€” Fixed `GET /api/currency/currencies` latency with 1-hour TTL in-memory cache in `exchange-rate.service.ts:82-88`
- âœ… **Fix 401 on Dashboard (Auth Cookie Routing)** â€” Changed `NEXT_PUBLIC_API_URL` from `https://api.haypbooks.com` to empty string in `.env.production` on VPS so axios requests stay same-origin through nginx proxy.
- âœ… **Fix 403 on Dashboard (RolesGuard)** â€” Updated `Backend/src/auth/guards/roles.guard.ts` line 33 to treat `role='business'` as equivalent to `'owner'` (case-insensitive + businessâ†’owner mapping). Committed to git and deployed to VPS.
- âœ… **Fix Undeposited Funds Account Code Mismatch** â€” Replaced hardcoded `'1050'` in `Backend/src/shared/sub-ledger.service.ts` with `SYSTEM_ACCOUNTS.UNDEPOSITED_FUNDS.code` for `postBankDepositToGL`. This fixes bank deposit GL posting by using the current COA code `'1170'` instead of the legacy, missing `'1050'` account.
- âœ… **Fail-fast unbalanced JE postings** â€” Changed `Backend/src/shared/sub-ledger.service.ts` so `createPostedJE()` throws `BadRequestException` when total debits and credits differ by more than 0.005 instead of quietly returning null and skipping the journal entry. â€” The P1 workstream item on silent unbalanced postings is closed by this fix; removed from the active P1 list (roadmap reconciliation, August 2026).
- âœ… **Fix Void/Reversal JE Dating** â€” All void/reversal methods (createReversingJE + 8 callers, reverseInvoiceGL, reversePaymentReceivedGL, reverseCreditNoteGL, reverseWriteOffGL, reverseRefundGL, reverseRevenueRecognitionGL, voidJournalEntry) now use the original entry's date instead of `new Date()`, preventing accounting period corruption. Voids in closed periods now correctly fail.
- âœ… **Fix voidDeposit Missing GL Reversal** â€” Added `createReversingJE` call to `voidDeposit` in `banking.repository.ts`, creating a proper GL reversal JE when a bank deposit is voided. Previously the original deposit JE remained posted, permanently overstating cash and understating undeposited funds.
- âœ… **Fix DB Connection Limit** â€” Added `&connection_limit=10` to DATABASE_URL in `Backend/.env` on VPS.
- âœ… **Fix CORS on api.haypbooks.com** â€” Added port 80 proxy block in nginx for `api.haypbooks.com`.
- âœ… **Onboarding Re-Trigger Fix** â€” Fixed: added `getOnboardingStatus()` helper in `prisma-auth.service.ts` (L100-111) that queries `OnboardingData.complete` instead of non-existent `user.onboardingComplete` field. All 4 auth response locations (signup L54, login L184, createSessionForUser L255, refresh L318) updated. Build passes. âœ… Deployed to VPS (committed in `c238607f`, auto-deployed via GitHub Actions).
- âœ… **Dashboard Banner Bug Fix** â€” Resolved stale error state in `useCompanyId()` hook and fixed `OwnerDashboard.tsx` condition that incorrectly showed "No company linked" banner despite valid API responses
- âœ… **Onboarding Transaction Timeout Fix** â€” Moved COA seeding outside the onboarding Prisma interactive transaction and replaced 40+ sequential `account.create()` calls with a single batched `createMany()` operation. Transaction duration reduced from 60+ seconds to under 2 seconds, resolving the production onboarding blocker.
- âœ… **PDFKit Build Fix** â€” Added missing `@types/pdfkit` dev dependency to package.json, resolving VPS build error TS2307: Cannot find module 'pdfkit'.
- âœ… **VPS Auto-Deploy Pipeline** â€” GitHub Actions â†’ SSH â†’ deploy.sh â†’ PM2 restart. Fully operational. Every push to main auto-deploys to production.
- âœ… **Logo Replacement** â€” All placeholder logos replaced with HB_Logo.png. Favicon and metadata configured.
- âœ… **Repo Cleanup** â€” Removed stray root files, malformed filenames, and all "open source" references. HaypBooks is proprietary.
- âœ… **Build Error Fixes** â€” Resolved TypeScript/Prisma build errors in owner.service.ts.
</details>

- âœ… **Multi-Currency Support (Plan B)** â€” Full end-to-end multi-currency accounting: Currency/ExchangeRate models with 15 seeded currencies, ExchangeRateService with enforceCurrency() helper and live API rate fetching, currency enforcement in transaction services, shared formatCurrency() utility, company base currency selector, multi-currency financial reporting with display currency selector on P&L/Balance Sheet/Cash Flow/Trial Balance.
- âœ… **Zypra AI Assistant (Plan F, Phase 1)** â€” Floating chat widget with Gemini-powered accounting Q&A, lazy initialization, quick actions, system prompt guardrails.
- âœ… **Cinematic Intro Restoration** â€” Reverted intro animation from HB logo back to "Haypbooks" text via git history.
- âœ… **Owner Module DI Fix** â€” Added CompaniesModule to OwnerModule imports, resolving 478-restart crash loop in production.

- âœ… **Hub Selection Screen Redesign** â€” Fixed: Added `isHubSelection` check to `client-root.tsx` (L102, L119) to exclude `/workspace` from the OwnerTopBar + OwnerSidebar layout. The hub selection page now renders as a clean full-page experience. The existing WorkspacePage component already had all three panels (Companies list, Practice list, Owner Dashboard button). No git history revert needed.
- âœ… **Fix JWT Payload** â€” Completed August 25, 2026: Added `systemRole` and `isOwner` to JWT payload at all 4 sign locations in `prisma-auth.service.ts`. Added `getIsOwner()` helper querying `Workspace.ownerUserId`. Updated `jwt.strategy.ts` validate() return. Added `systemRole` to User interface.
- âœ… **Fix `mapRoleForFrontend` Inconsistency** â€” Completed August 24, 2026: Confirmed NOT a bug. Three orthogonal role layers exist: hub role (JWT `role`), RBAC role (cookie `role`), platform role (JWT `systemRole`). The `mapRoleForFrontend` function correctly maps workspace owners to `'admin'` RBAC permissions. Documented in `docs/architecture/ROLE_SYSTEM.md`.
- âœ… **Deploy.sh Stale Cache Fix** â€” Completed August 26, 2026: Added `rm -rf .next` to deploy.sh before `npm run build` to prevent corrupted Next.js incremental builds from causing 400 errors on static assets.
- âœ… **Onboarding Page Syntax Fix** â€” Completed August 26, 2026: Fixed malformed `saveCurrentStep()` function in `onboarding/page.tsx` that was causing build failures on the VPS.
- âœ… **Phase H-0 Three-Role Foundation (SUPER_ADMIN Provisioning)** â€” Completed August 27, 2026: All code changes previously verified (systemRole + isOwner in JWT at all sign locations in prisma-auth.service.ts, jwt.strategy validate(), RolesGuard SUPER_ADMIN check). VPS tasks executed: ADMIN_EMAIL and ADMIN_DEFAULT_PASSWORD added to Backend .env, seed-admin run via `npm run db:seed:admin` (required transient NODE_OPTIONS=--max-old-space-size=8192 after OOM), SUPER_ADMIN login verified â€” decoded JWT contains systemRole: 'SUPER_ADMIN' and isOwner: true. All three H-0 boxes now closed.
- âœ… **Add companies module README** â€” Created `Haypbooks/Backend/src/companies/README.md` documenting the multi-company management module's architecture, endpoints, and GL integration, complying with the Product Maturity Standard's documentation requirements.
- âœ… **Add banking module README** â€” Created `Haypbooks/Backend/src/banking/README.md` documenting the banking module's bank account management, reconciliation workflows, and GL posting integration, complying with the Product Maturity Standard's documentation requirements.
- âœ… **Remove stale dev-only checklists** â€” Deleted unused development tracking components: removed the Checklist button from OwnerTopBar.tsx, deleted OwnerProgressChecklist.tsx (unused hardcoded tracker), and deleted PracticeProgressChecklist.tsx (never-rendered unused modal). No production code impacted. Commit: 220864e8.

---

---

## Priority Backlog

### P1: High Priority
- **Set Cookie Domain for Cross-Subdomain Support** â€” `Backend/src/auth/auth.controller.ts:80-84` cookie options: add `domain: '.haypbooks.com'` and change `sameSite: 'lax'` to `sameSite: 'none'` (with `secure: true`). âš ï¸ Security-impacting change â€” verify CSRF protection still works after this. Test login/logout/refresh flows on both `haypbooks.com` and `api.haypbooks.com`.
- **Consolidate API Clients** â€” Replace raw `fetch()` calls with the axios `apiClient` instance (has interceptors, error handling, `withCredentials`). Or create a shared `fetchWithAuth()` wrapper in `Frontend/src/lib/api.ts`.
- **ClientRoot UI Fix** â€” Nav leak on `/workspace` fixed via `isHubSelection` check (see Hub Selection above). Remaining: `useCompanyId()` hook for conditionally rendering minimal layout when no company is selected is still open â€” separate concern.

### P2: Medium Priority
- **Fix Phantom `role` Field** â€” `Backend/src/repositories/interfaces/user.repository.interface.ts:8` declares 8 role values (`'owner' | 'admin' | 'manager' | 'ar-clerk' | 'ap-clerk' | 'viewer' | 'accountant' | 'both'`) but DB has no `role` column â€” Prisma maps `systemRole` to `@map("role")`. Repository synthesizes `role` from `preferredHub` producing only `'business'` or `'accountant'`. Clean up the interface to match reality.
- **Build Platform Owner Dashboard** â€” Separate UI for `SUPER_ADMIN` users (JP) to access platform endpoints: all users, storage usage, metrics, plan distribution. Current `OwnerDashboard` is for company admins, not platform owners. Backend endpoints already exist (`/api/owner/users`, `/api/owner/storage/usage`, `/api/owner/metrics/*`). Full platform owner dashboard with dedicated layout. The owner is the HaypBooks platform master â€” this dashboard monitors and controls everything across all companies and practices. Required navigation sections:

  **1. ðŸ“Š Overview** â€” Platform KPIs at a glance: total companies, practices, users; subscription health (active/trial/expired); revenue metrics; recent signups; system health indicators.

  **2. ðŸ¢ Companies** â€” All companies on the platform. Table: name, owner, plan, status (active/trial/expired/suspended), user count, storage usage, created date. Actions: view details, suspend, activate. Search and filter by plan/status.

  **3. ðŸ“‘ Practices** â€” All accounting practices. Table: practice name, accountant, plan, status, linked companies count, created date. Actions: view details, suspend, activate. Search and filter.

  **4. ðŸ‘¥ Users** â€” Platform-wide user management. Table: name, email, role, company/practice, status, last login. Actions: view, delete (with file cleanup â€” see P2: User Account Deletion). Search and filter by role/status/company.

  **5. ðŸ’³ Subscriptions** â€” Subscription health and management. Overview cards: MRR, active count, churn rate. Subscription list with plan details and status. Expiring soon alerts. Plan definitions if dynamic pricing is implemented.

  **6. ðŸ“ Storage** â€” Platform storage monitoring. Total usage, per-company breakdown, file type distribution, cleanup tools. Identify storage-heavy tenants.

  **7. ðŸ“‹ Audit Log** â€” Platform activity tracking. Table: timestamp, user, action, entity, details. Filters: by user, action type, date range, entity. Login history.

  **8. âš™ï¸ Platform Settings** â€” Global configuration. Feature flags, email templates, maintenance mode toggle, default subscription plans, platform branding.

  **9. ðŸ©º System Health** â€” Infrastructure monitoring. CPU, RAM, disk usage; API error rates; database size; active sessions; uptime.
- **Build Practice Dashboard** â€” Accountant workspace dashboard, separate from company dashboard.
- **Three-Role Architecture** â€” Proper separation of: (1) Platform Owner (`SUPER_ADMIN` â€” manages the SaaS platform), (2) Company Admin (`business` / `preferredHub: OWNER` â€” manages their company), (3) Practice Admin (`accountant` / `preferredHub: ACCOUNTANT` â€” manages their practice). Each needs its own dashboard, routing guard, and API scope.
- **Remove Stale Hardcoded Demo Data** â€” `Frontend/src/components/HubSidebar.tsx:54` has `juan@haypbooks.com` and `Frontend/src/components/TopBar.tsx:173` has `demo@haypbooks.com`. Replace with dynamic user data from `useUser()`.
- **Reduce `--max-old-space-size`** â€” Currently 4096MB in `ecosystem.config.js`, should be 512-1024MB for a CX33 (4GB RAM VPS).
- **Add Porkbun Domain Info to README** â€” Domain `haypbooks.com` purchased on Porkbun, DNS via Cloudflare.
- **Verify Memory Leak Fix** â€” Monitor `haypbooks-backend` memory over 24-48hrs to confirm `metrics.ts` hourly `counts.clear()` resolves the issue long-term.
- **User Account Deletion with File Cleanup** â€” Owner/Admin can permanently delete a user account. When a user is deleted, all their associated files (uploaded documents, attachments, exported reports) are also permanently deleted from storage. Requires cascade delete logic across User â†’ WorkspaceUser â†’ Company memberships, and a file cleanup service that removes the user's files from storage.

---

## Future Plans

| Plan | Name | Status | Blocked By |
|------|------|--------|------------|
| A | Self-Hosted PostgreSQL Migration | Not Started | E2E testing completion |
| C-3 | Budgeting Module Enhancements | Not Started | â€” |
| D | Approval Workflows | Not Started | â€” |
| E | Fixed Asset Management | Not Started | Core accounting E2E validation |
| F-2 | Zypra AI Phase 2 (Persistent History, Document Q&A, Advanced Insights) | Not Started | â€” |
| G | Product Maturity Standard & Audit Framework | In Progress â€” Standard v1.0 adopted; Phase 1 audit pending | All six audit phases (S1â€“S6) completed and signed off |
| H | Three-Role Architecture Refactor | H-3 Partially Implemented | Plan G completion |

### Plan A: Self-Hosted PostgreSQL Migration
**Goal**: Migrate from Neon hosted PostgreSQL to a self-hosted PostgreSQL instance on the VPS or a dedicated database server.

**What needs to be achieved**:
- Install and configure PostgreSQL on the VPS (or a separate DB server) with production-grade settings (shared_buffers, work_mem, connection pooling via PgBouncer)
- Set up automated backup with pg_dump cron jobs (daily full, hourly WAL archiving) and verified restore procedures
- Migrate all existing data from Neon using `pg_dump`/`pg_restore` with zero-downtime cutover (dual-write or DNS switchover)
- Update all environment variables (DATABASE_URL) and verify Prisma migrations apply cleanly against the new instance
- Configure firewall rules so only the VPS (and local dev) can reach PostgreSQL port 5432
- **Blocked by:** E2E testing completion â€” we need confidence that the data layer works correctly before migrating to self-hosted

### Plan C Phase 3: Budgeting Module Enhancements
**Status**: Not Started | **Depends on**: Plan C Phase 2 (fully completed and deployed)

**Goal**: Extend the budgeting module with templates, alerts, exports, and forecasting capabilities.

**What needs to be achieved**:
- **Budget Templates**: Pre-built budget templates for common industries (retail, SaaS, professional services, manufacturing) that auto-populate account lines with realistic defaults based on chart of accounts structure
- **Variance Alerts**: Automated notifications (in-app first, email later) when actual spending exceeds budgeted amounts by a configurable threshold (e.g., 10%, 20%, 50%) â€” alert rules stored in database with per-company customization
- ~~**CSV/PDF Export**: Export budget vs actual reports to CSV (with proper number formatting and column headers) and PDF (styled to match the existing financial report layout) from the vs-actual page~~ â€” COMPLETED: CSV/PDF budget exports are fully functional and deployed.
- **Rolling Forecasts**: Ability to update budget amounts mid-fiscal-year and compare original budget vs. revised forecast vs. actuals â€” requires a `scenario` field extension (DRAFT, ORIGINAL, REVISED, FORECAST)
- **Cash Flow Integration**: Link budget data to cash flow forecasting so projected cash positions account for budgeted income and expenses by month
- **Budget Ownership & Comments**: Assign budget line ownership to team members and add comment threads on individual budget lines for collaboration during budget review cycles

*Status note (Aug 27, 2026): Core budgeting module (Plan C
Phases 1-2) is deployed; Phase 3 enhancements â€” templates,
variance alerts, rolling forecasts, cash-flow integration,
ownership/comments â€” remain unimplemented. Retained under
In Progress to track future priorities.*

### Plan D: Approval Workflows
**Goal**: Provide controlled approval flows for high-risk accounting actions to enforce internal controls and audit compliance.

**What needs to be achieved**:
- Implement role-based approval matrix: define which roles can approve which action types (journal entries, bank reconciliations, payments above threshold)
- Create an `Approval` model with states (PENDING, APPROVED, REJECTED, CANCELLED) and approval chains supporting single-approver and multi-level sequential approval
- Add approval requirement to journal entry creation when the entry total exceeds a configurable company-level threshold
- Add manager sign-off step to bank reconciliation completion â€” reconciliation cannot be finalized until an approver reviews and approves
- Build an approvals dashboard listing pending items for the current user with one-click approve/reject actions and comment/reason fields
- Emit audit log entries for every approval action (who approved, when, reason, linked record)

### P1: Accounting Ledger Integrity Workstream (NEW)
> All items verified by Audit 001/001-B (August 27, 2026). These defects let business events bypass or corrupt the General Ledger.
- **Non-atomic business + GL writes** â€” invoice-send / payment / deposit flows run business-data and JE-posting in SEPARATE Prisma `$transaction`s; a crash between them permanently desyncs books.
- **Balance Sheet missing Current Year Earnings** â€” `reporting.service.ts:L514-L533`: equity aggregates only equity-class accounts; no YTD-net-income plug â†’ BS out of balance between closes.
- **Document numbering races** â€” atomic `DocumentSequence.upsert()` exists (`schema.prisma:L5137`; invoices + sales orders only, `ar.repository.ts:L133-L162`). Extend it to Journal Entries (currently max()+1 scans in sub-ledger/accounting repository) and credit notes (count()+1).
- **Banking integrity gaps** â€” reconciliation completion does not enforce difference == 0; auto-match ignores amounts; transaction import lacks dedup fingerprinting (re-import double-counts); newly created bank accounts get no linked GL account.


- **Legacy `createAndPostJE` drops the `entryNumber` parameter before `journalEntry.create`** â€” tracked defect in sub-ledger entry numbering: the legacy path persists posted JEs without their intended entry number; honor the parameter or retire the legacy path.
- **FX revaluation placeholder** â€” endpoint returns last-50-JEs proxy; real unrealized gain/loss computation + posting absent. Unify base-currency fallbacks ('PHP' vs 'USD' across sub-ledger/gl-integration/exchange-rate/accounting).

### Plan E: Fixed Asset Management
**Goal**: Add fixed asset tracking, depreciation scheduling, and disposal/revaluation workflows for long-term asset accounting.

**What needs to be achieved**:
- Create FixedAsset model with fields: name, description, purchaseDate, purchasePrice, salvageValue, usefulLifeYears, depreciationMethod (STRAIGHT_LINE, DECLINING_BALANCE), currentBookValue, status (ACTIVE, DISPOSED, UNDER_REVIEW)
- Build asset register page with CRUD, filtering by department/category/status, and summary cards showing total asset value and accumulated depreciation
- Implement depreciation calculation engine supporting straight-line and declining balance methods with monthly depreciation journal entries auto-generated on schedule
- Create asset disposal workflow: mark asset as disposed, record disposal date/proceeds/loss-or-gain, generate disposal journal entry
- Add asset revaluation workflow: record new fair value, generate revaluation surplus/impairment journal entry
- **Blocked by:** Core accounting E2E validation â€” need verified journal entry and financial statement accuracy before generating automated depreciation entries

### Plan F-2: Zypra AI Phase 2
**Goal**: Evolve Zypra from a simple Q&A widget into a persistent, context-aware accounting assistant.

**What needs to be achieved**:
- Persistent conversation history stored in database (linked to userId and companyId) so users can reference previous questions
- Document Q&A: upload invoices, bank statements, or receipts and have Zypra extract and answer questions about the document content
- Advanced insights: Zypra proactively identifies anomalies (unusual expenses, missing reconciliations, late payments) and surfaces them in the chat
- Context-aware responses: Zypra knows which company the user is viewing and filters all responses to that company's data
- Quick action execution: users can ask Zypra to perform actions ("create a journal entry for $500 rent expense") with confirmation prompts

---

### Plan G: Product Maturity Standard & Audit Framework

**Status**: Active â€” framework formally adopted via
`docs/standards/PRODUCT_MATURITY_STANDARD.md`.

**Role**: This plan operationalizes the Product Maturity Standard
as the project's Definition of Done. The standard document is the
single source of truth for the six audit perspectives, the
five-tier maturity scale, P0â€“P3 classification, the ERPNext /
QuickBooks benchmark protocol, the standard Aâ€“W audit report
structure, and the binding anti-feature-creep rule.

**Audit phases** (each phase = one HYDRA audit prompt producing an
Aâ€“W report, followed by MANTRA execution prompts for each batch of
fixes):
  Phase 1 â€” Accounting & Ledger Integrity (S1)
  Phase 2 â€” Security (S2)
  Phase 3 â€” Data Integrity & Persistence (S3)
  Phase 4 â€” Concurrency & Reliability (S4)
  Phase 5 â€” UX & API Consistency (S5)
  Phase 6 â€” Quality Operations (S6)

**Execution approach**: Each phase should be executed as a separate
Hydra audit prompt, followed by Mantra execution prompts for each
batch of fixes. Phases can be partially parallelized (1-2 first,
then 3-4, then 5-6).

**Defect intake**: confirmed defects enter the roadmap Priority
Backlog under their P-classification with the audit report section
as citation. The existing P1 Accounting Ledger Integrity Workstream
remains the leading candidate input for Phase 1.

---

### Plan H: Three-Role Architecture Refactor

**Goal:** Fully separate three admin roles â€” Owner Admin (platform owner), Company Admin (business user), and Practice Admin (accountant) â€” with isolated dashboards, navigation, API endpoints, subscription enforcement, and database isolation.

**Status:** In Progress
**Blocked By:** P0 items (JWT payload fix, onboarding regression), Plan G completion
**Priority:** HIGH â€” foundation for all future feature development

**Context:** Since Phase H-0 (completed August 27, 2026), SUPER_ADMIN is provisioned via prisma/seed-admin.ts, carries systemRole in the JWT (jwt.strategy.ts:32) and API responses (prisma-auth.service.ts:57), and receives platform-endpoint access through the RolesGuard check (roles.guard.ts:38). Effective hub roles remain 'business' and 'accountant' (synthesized from preferredHub) and all workspace owners map to RBAC 'admin' â€” see docs/architecture/ROLE_SYSTEM.md. Dedicated three-role separation (distinct Owner / Company / Practice dashboards, subscription enforcement, database isolation) is NOT yet implemented, and no subscription plan capacities are enforced.

---

#### Phase H-0: Foundation â€” JWT + Auth Chain Fix
> **Status**: âœ… FULLY COMPLETED â€” August 27, 2026. Code changes deployed; VPS provisioning executed and verified (SUPER_ADMIN created, login + JWT payload confirmed).
**Prerequisite:** Must complete BEFORE any other Phase H work.
**Depends on:** P0 items (JWT payload, mapRoleForFrontend)

- [x] Add `systemRole` and `isOwner` to JWT payload â€” done in prisma-auth.service.ts + jwt.strategy.ts
- [x] Add `isOwner` to JWT payload â€” done (L52, L194, L258, L332 in `prisma-auth.service.ts`)
- [x] Update `jwt.strategy.ts:28-32` validate() to return `systemRole` and isOwner â€” done (L32-33)
- [x] Update `RolesGuard` to check `systemRole === 'SUPER_ADMIN'` for platform endpoints
- [x] Expose `systemRole` in API responses and frontend User types (backend users.service.ts, prisma-auth.service.ts + frontend auth.service.ts, use-user.ts)
- [x] Standardize role values â€” NOT A BUG (three orthogonal layers, see docs/architecture/ROLE_SYSTEM.md). Renaming deferred to Phase H-6.
- [x] Run `seed-admin.ts` on VPS with `ADMIN_EMAIL=paulescuadra25@gmail.com` to create the Owner Admin account
- [x] Add `ADMIN_EMAIL` and `ADMIN_DEFAULT_PASSWORD` to VPS `.env`
- [x] Verify SUPER_ADMIN can log in and JWT contains `systemRole: 'SUPER_ADMIN'`

#### Phase H-3: Owner Admin Dashboard
**Depends on:** None â€” prerequisite work completed

- [ ] Build Platform Owner Dashboard component (overview: total companies, users, revenue, storage, growth charts)
- [x] Build Storage Management page (per-company storage, limits, R2 usage)
- [x] Build User Management page (all users, suspend/reactivate, view sessions, role assignment)
- [x] Build Platform Metrics page (plan distribution, growth history, snapshots, MRR)

*Implementation note (Aug 27, 2026): these pages exist as frontend routes calling live-shaped APIs, but are absent from the sidebar (linked via WorkspacePage/TopBar), client-gated to SUPER_ADMIN via src/app/(platform-admin)/layout.tsx. All 9 /api/owner/* endpoints are implemented and guarded (JwtAuthGuard + SystemRoleGuard, SUPER_ADMIN-only) in Backend/src/owner/owner.controller.ts: health, storage/usage, storage/usage/:companyId, storage/limits/:companyId, users, users/:userId/status, metrics/plan-distribution, metrics/snapshot, metrics/history. The (platform-admin) pages consume them via apiClient. No /api/platform/* endpoints exist anywhere; the earlier "unimplemented" note was a doc error.*
- [ ] Build Subscription Overview page (all active subscriptions, revenue, churn)
- [ ] Build Platform Settings page (global config, feature flags per workspace)
- [ ] Owner Admin should see all three dashboards (Platform + Company + Practice) via a dashboard switcher
- [ ] Owner Admin has NO subscription plan â€” unlimited access, no capacity restrictions

#### Phase H-4: Subscription Enforcement
**Depends on:** None â€” prerequisite work completed

- [ ] Create `SubscriptionGuard` â€” checks plan capacity before allowing company/client creation
- [ ] Enforce `Plan.maxCompanies` â€” block company creation when at capacity
- [ ] Enforce `Plan.maxClients` â€” block client acceptance when at capacity
- [ ] Create subscription status check middleware â€” block access when subscription is `PAST_DUE`, `CANCELED`, or `EXPIRED`
- [ ] Build subscription limit UI â€” show current usage vs plan limits in settings
- [ ] Upgrade/paywall flow â€” prompt users to upgrade when hitting limits
- [ ] Seed plan records (FREE, STARTER, PRO, ENTERPRISE or equivalent) â€” currently no plans exist in DB
- [ ] Subscription Lifecycle Auto-Delete Policy â€” user/company accounts with no active plan AND no active free trial receive a deletion WARNING at day 25 and are PERMANENTLY DELETED (including associated data) at day 30; users must avail a plan to keep the account alive
- [ ] Auto-Delete Exemption Rule â€” the platform owner / SUPER_ADMIN account(s) are permanently exempt from subscription expiry checks and auto-deletion, without exception

#### Phase H-5: Practice Admin Enhancement
**Depends on:** None â€” prerequisite work completed

- [ ] Expand practice nav from 2 sections to: Dashboard, Clients, Team, Settings, Billing, Reports
- [ ] Implement Practice XP/tier gamification system (schema fields `practiceTier`/`practiceXp` exist but are never read/written)
- [ ] Practice subscription plans with capacity limits (clients per tier)
- [ ] Practice Admin should see only Practice Dashboard (not Company Dashboard)
- [ ] Subscription-plan users should only see two workspace options at creation: Company or Practice (not both unless allowed by plan)

#### Phase H-6: Database & Schema Cleanup
**Depends on:** All previous phases

- [ ] Fix phantom `role` field in `User` interface â€” update `user.repository.interface.ts:8` to match reality (only `'business'` or `'accountant'` can be returned)
- [ ] Consider renaming `preferredHub` values (`OWNER` â†’ `COMPANY`) to eliminate confusion between "workspace owner" and "platform owner"
- [ ] Clean up `WorkspaceType` enum usage â€” ensure Practice creation explicitly sets `type = PRACTICE`
- [ ] Verify `practiceId` on `AuditLog` is populated for practice-scoped actions (field exists at `schema.prisma:9824` but may not be written consistently)
- [ ] Include `seed-admin.ts` in the default deploy pipeline or document manual step

---

**Known Issues to Track:**
- ðŸ”´ No subscription capacity enforcement anywhere
- ðŸ”´ Practice XP/tier system is dead schema (fields exist, no code)
- ðŸŸ¡ Cross-role creation allowed (Company Admin can create Practice)
- ðŸŸ¡ WorkspacePage shows platform admin link to any workspace owner

---

- ðŸŸ¡ Owner-API doc error corrected â€” all 9 /api/owner/* endpoints are implemented and SUPER_ADMIN-guarded (owner.controller.ts) and consumed by the platform-admin pages via apiClient; no /api/platform/* endpoints exist.

### Documentation Rule (Standing Policy)

- Every implemented module or subsystem must maintain its own
  `README.md` located at the module root.
- Each module README records: architecture overview, key
  components and responsibilities, important files, behavioral
  contracts, decisions and their rationale, and usage examples.
- A roadmap item may be marked DONE only when its behavior is
  verified AND its module README exists and is accurate.
- Purpose: preserve durable context for future AI agents and
  human maintainers working on this repository.

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
- [ ] Test suite exists but coverage is uneven (~87 genuine tests at cd3d30e8: 47 backend spec/test files incl. general-ledger, AP lifecycle, sub-ledger reversal, auth integration; 22 frontend component/route tests; 18 Playwright e2e specs). Still uncovered/thin: payrollâ†’GL posting, banking reconciliation matching, tenant-isolation scoping, document-numbering concurrency, financial-report correctness. No coverage thresholds enforced in CI.
- [ ] **Backend unit-suite baseline unproven** â€” Five audit attempts could not capture a complete npm test:unit run: the log stops after the npm invocation + ts-jest deprecation warning (zero suites start), and the --json retry produced a 0-byte results file. tsc --noEmit is clean and targeted specs pass, but a green full-suite baseline has never been evidenced. Requires one machine-level successful full run before test-suite health can be claimed.
- Resolved â€” see Completed Projects. Fix: hourly counts.clear() in metrics.ts + PM2 max_memory_restart 1G.
- [x] **`bot-connect.js` 404 errors** â€” Resolved. No references to `bot-connect.js` found in Frontend codebase.
- [ ] Stabilize 3 flaky tests: 2 backend (prisma seed race conditions in auth tests), 1 frontend (Sidebar permission-check timing issue).

