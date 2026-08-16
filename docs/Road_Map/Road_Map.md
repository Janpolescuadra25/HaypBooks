# HaypBooks — Development Roadmap

> Last updated: August 17, 2026

## Completed Projects
- ✅ **VPS Auto-Deploy Pipeline** — GitHub Actions → SSH → deploy.sh → PM2 restart. Fully operational. Every push to main auto-deploys to production.
- ✅ **Logo Replacement** — All placeholder logos replaced with HB_Logo.png. Favicon and metadata configured.
- ✅ **Repo Cleanup** — Removed stray root files, malformed filenames, and all "open source" references. HaypBooks is proprietary.
- ✅ **Build Error Fixes** — Resolved TypeScript/Prisma build errors in owner.service.ts.
- ✅ **Multi-Currency Support (Plan B)** — Full end-to-end multi-currency accounting: Currency/ExchangeRate models with 15 seeded currencies, ExchangeRateService with enforceCurrency() helper and live API rate fetching, currency enforcement in transaction services, shared formatCurrency() utility, company base currency selector, multi-currency financial reporting with display currency selector on P&L/Balance Sheet/Cash Flow/Trial Balance.
- ✅ **Zypra AI Assistant (Plan F, Phase 1)** — Floating chat widget with Gemini-powered accounting Q&A, lazy initialization, quick actions, system prompt guardrails.
- ✅ **Cinematic Intro Restoration** — Reverted intro animation from HB logo back to "Haypbooks" text via git history.
- ✅ **Onboarding Fix** — Added onboardingMode field to User model with migration, resolving 500 error during company creation.
- ✅ **Owner Module DI Fix** — Added CompaniesModule to OwnerModule imports, resolving 478-restart crash loop in production.

---

## In Progress

### Plan C Phase 3: Budgeting Module Enhancements
**Status**: Not Started | **Depends on**: Plan C Phase 2 completion (4 remaining items being addressed)

**Goal**: Extend the budgeting module with templates, alerts, exports, and forecasting capabilities.

**What needs to be achieved**:
- **Budget Templates**: Pre-built budget templates for common industries (retail, SaaS, professional services, manufacturing) that auto-populate account lines with realistic defaults based on chart of accounts structure
- **Variance Alerts**: Automated notifications (in-app first, email later) when actual spending exceeds budgeted amounts by a configurable threshold (e.g., 10%, 20%, 50%) — alert rules stored in database with per-company customization
- **CSV/PDF Export**: Export budget vs actual reports to CSV (with proper number formatting and column headers) and PDF (styled to match the existing financial report layout) from the vs-actual page
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
