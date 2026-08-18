# HaypBooks — Development Roadmap

> Last updated: August 17, 2026

## Completed Projects
- ✅ **Dashboard Banner Bug Fix** — Resolved stale error state in `useCompanyId()` hook and fixed `OwnerDashboard.tsx` condition that incorrectly showed "No company linked" banner despite valid API responses
- ✅ **Onboarding Re-Trigger Fix** — Added `lastAccessedAt: new Date()` to Owner WorkspaceUser create/update operations during onboarding, preventing the onboarding flow from reappearing after re-login
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

## Future Plans

| Plan | Name | Status | Blocked By |
|------|------|--------|------------|
| A | Self-Hosted PostgreSQL Migration | Not Started | E2E testing completion |
| D | Approval Workflows | Not Started | — |
| E | Fixed Asset Management | Not Started | Core accounting E2E validation |
| F-2 | Zypra AI Phase 2 (Persistent History, Document Q&A, Advanced Insights) | Not Started | — |

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
- [ ] Memory leak investigation and fix (see Technical Debt section above)
- [ ] Slow `/api/currency/currencies` endpoint (5+ second response time)
- [ ] `bot-connect.js` 404 errors in frontend logs
- [x] Verify onboarding re-trigger bug is resolved after `lastAccessedAt` fix

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
- **Known bug**: Dashboard shows "No company linked" banner even when `GET /api/companies/current` returns 200 with valid company data — frontend condition logic is broken

#### Phase 3: Backend Architecture & API Audit (Backend Engineer Perspective)
**Goal:** Complete all in-progress features (budgeting enhancements, budget templates).
- Audit all API endpoints for proper error handling, validation, and consistent response formats
- Review database queries for N+1 issues, missing indexes, and performance bottlenecks
- **Known slow endpoint**: `GET /api/currency/currencies` takes 5+ seconds — needs profiling and optimization
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
### Memory Leak Investigation (CRITICAL — P0)
- **Symptom:** Backend starts at ~17.7MB after PM2 restart, grows to 4.0GB+ over time
- **Impact:** VPS RAM exhaustion, eventual OOM kill, production downtime
- **Investigation Steps:**
  1. Add `clinic.js` heap profiling on VPS: `npm install -g clinic && clinic heapprofiler -- node dist/main.js`
  2. Capture heap snapshots at intervals using Node.js `v8.writeHeapSnapshot()` via a dedicated admin endpoint (e.g., `GET /api/debug/heap-snapshot`) — protect with a simple env-flag gate
  3. Check Prisma connection pool settings — verify `connection_limit` in DATABASE_URL and Prisma schema, ensure connections are released after each request
  4. Audit all PDFKit/stream usage — ensure `doc.end()` is called, streams are piped properly, and no orphaned buffers exist
  5. Audit all `setInterval`/`setTimeout` calls — ensure they are cleared on module destroy
  6. Audit all event listeners (`on`, `addEventListener`) — ensure they have matching `off`/`removeEventListener` calls
  7. Check for in-memory caches (Maps, Objects used as caches) that grow unbounded — add size limits or TTL where found
  8. Use `process.memoryUsage()` logging on a 5-minute interval (temporary) to track growth rate and correlate with traffic patterns
  9. Review PM2 logs for patterns — does memory spike after specific endpoints are called? (e.g., CSV/PDF export, onboarding, currency endpoint)
- **Quick Mitigation (until root cause found):** PM2 `max_memory_restart 1G` already applied — backend auto-restarts at 1GB threshold
- [ ] **Slow `/api/currency/currencies` endpoint** — Takes 5+ seconds to respond. Needs profiling, caching, or query optimization.
- [ ] **`bot-connect.js` 404 errors** — Frontend is requesting a non-existent `bot-connect.js` script, generating unnecessary 404 errors in backend logs.
