# HaypBooks Frontend Roadmap
> **Last Updated:** August 10, 2026 | **Branch:** `main` (84 commits ahead) | **349 built pages** | **26 ComingSoon stubs** | **25 service files**

---

## Completed Modules (19)

| Module | Batches | Pages Built | Service File | Status |
|---|---|---|---|---|
| Budget | 5A-5B | 4 | budget.service.ts (10 methods) | ✅ Complete |
| Ledger Health | 7B-1/2 | 2 | accounting.service.ts | ✅ Complete |
| Tax | 7A-1-5 | 10 | tax.service.ts (12 methods) | ✅ Complete |
| Period Close | 8A-1/2 | 3 | accounting.service.ts | ⚠️ 1 deferred (sign-offs) |
| Fixed Assets | 8B-1/2 | 3 | accounting.service.ts | ⚠️ 1 deferred (insurance) |
| Inventory | 9A-1-4 | 13 | inventory.service.ts (15 methods) | ⚠️ 6 deferred |
| Payroll | 10A-1-5 | 13 | payroll.service.ts (14 methods) | ⚠️ 6 deferred |
| Organization | 12A-1/2 | 4 | organization.service.ts (5 methods) | ✅ Complete |
| Projects | 13A-1-4 | 8 | projects.service.ts (9 methods) | ⚠️ 6 deferred |
| Time | 14A-1/2 | 4 | time.service.ts (7 methods) | ⚠️ 1 deferred |
| Tasks & Approvals | E-1/E-2/E-3 | 10 | tasks-approvals.service.ts (9 methods) | ✅ Complete |
| Settings | F-1/F-2/F-3 | 12 | settings.service.ts (22 methods) | ✅ Complete |
| Compliance | G-1/G-2 | 6 | compliance.service.ts (20 methods) | ✅ Complete |
| Banking | pre-roadmap | 20 | banking.service.ts (45 methods) | ✅ Complete |
| Accountant Workspace | H | 1 | accountant-workspace.service.ts (4 methods) | ✅ Complete |
| Automation | I-1/I-2 | 6 | automation.service.ts (20 methods) | ✅ Complete |
| Integrations | J-1/J-2 | 8 | integration.service.ts (23 methods) | ✅ Complete |
| Reporting | L-1 | 8 | reporting.service.ts (20 methods) | ✅ Complete (L-1 + L-2) |
| Home Dashboard | K-1/K-2 | 6 | home.service.ts (5 methods) | ✅ Complete |

---

## Plan L: Reporting (✅ COMPLETE)

### L-1: ✅ Complete (commit 62e6396f)
- Created `reporting.service.ts` (20 methods: 6 category reports, 6 CSV exports, custom-reports CRUD, scheduled-reports CRUD)
- Built 6 category report pages: banking, expense, inventory, payroll, project, sales — each with date-range filter, data table with totals, CSV export
- Built 2 CRUD pages (table+modal pattern): custom-reports, scheduled-reports — full create/edit/delete with modal

### L-2: ✅ Complete (commit 0957d91e)
- Fixed URL convention in reporting.service.ts (20 methods → /reporting/* with query params)
- Added error state rendering with retry button to 6 category report pages
- Built analytics/analytics-dashboards — recharts KPI cards, bar + line charts, mock data
- Built custom-reports/report-builder — form + live preview, dynamic columns/filters, CSV download

---

## Deferred Stubs (22 total)

| Module | Stubs | Reason |
|---|---|---|
| Inventory | 6 | No backend (cycle-counts, bundles, cost-adjustments, landed-costs, write-downs, zones) |
| Payroll | 6 | No backend (bonuses-commissions, final-pay, payroll-adjustments, holiday-calendar, employee-documents, job-positions) |
| Projects | 6 | No backend (contracts, templates, schedule, progress-billing) + KPI UI (budget-vs-actual, profitability) |
| Time | 1 | KPI summary object (billable-time-review) |
| Period Close | 1 | No backend (sign-offs) |
| Fixed Assets | 1 | No backend (insurance) |
| Accounting | 1 | No backend (sign-offs) |

---

## Next Plans

### Immediate: Deployment Preparation

The frontend is now clean — all Plans L, N-1, N-2, N-3 are complete. Next steps:
1. R2 backend integration (install `@aws-sdk/client-s3`, replace multer `diskStorage`)
2. Set up infrastructure (Neon, Cloudflare R2, Render, SendGrid, Vercel, Porkbun DNS)
3. Deploy backend to Render, frontend to Vercel
4. Post-deployment testing

See "Deployment Roadmap" section below for full step-by-step guide.

### Plan N: Accounting Module Fixes (N-1 ✅, N-2 ✅, N-3 ✅ — COMPLETE)
Section 2 audit found 30 issues (7 critical, 13 significant, 10 minor). Top priorities:
- **N-1: Data-loss hotfixes** — Fix attachment upload, customerId payload, COA modal fields, remove console.logs (7 critical items)
- **N-2: UX improvements** — Add void reason modal, post confirmation, fix recurrence logic, fix contra styling, fix CSV import error reporting (13 significant items)
- **N-3: Code quality** — Remove 30+ `as any` casts, extract shared audit-log component, dead code cleanup (10 minor items)
- **Missing vs QB/ERPNext (10 items)** — Payment terms, FX revaluation logic, budget distribution (monthly), period close checklist, JE templates, account subtypes, cheque printing, cost center allocation, GL reconciliation, financial statement snapshots

### Post-Reporting: Deployment
See "Deployment Roadmap" section below.

### Plan M: HB_Owner Dashboard + Architecture Restructure (POST-L-2)

**Problem:** The current `(owner)` route treats the SaaS platform owner (JP) the same as a client. The platform owner should have a confidential admin dashboard separate from client-facing apps.

**Architecture Change:**
```
CURRENT (wrong):
  Login → Workspace Selection → (owner)/dashboard  (owner treated as client)

CORRECT:
  Owner credentials → HB_Owner dashboard (confidential, no workspace selection)
  Client credentials → Workspace Selection (HB_Online ↔ HB_Practice_Hub) → respective dashboard
```

**M-1: Route Restructure**
- Rename or clarify `(owner)/` route group to represent HB_Online (client-facing app)
- Rename `practice-hub/` to HB_Practice_Hub (accountant-facing app)
- Create new `(hb-owner)/` route group — confidential, NOT in workspace selection
- Update login flow: backend checks for "platform_owner" role → redirect to HB_Owner or workspace selection
- Keep workspace selection between HB_Online and HB_Practice_Hub only

**M-2: HB_Owner Dashboard — Core Pages**
- Overview dashboard (total clients, users, subscriptions, MRR, system health, activity feed)
- Client management (list all companies, search/filter, suspend, reactivate, delete, read-only access to client books)
- Subscription plan management (create/edit plans, pricing, upgrade/downgrade clients, payment history)
- User management (global user list, block/unblock by email or domain, delete, login history, force password reset)
- Activity & security (global audit log, login tracking, failed attempts, blocked domains, IP management)

**M-3: HB_Owner Dashboard — Advanced Pages**
- Platform configuration (feature flags, maintenance mode, announcement banner, email templates, API rate limits, storage quotas)
- Analytics (user growth, revenue trends, feature usage, churn analysis, most active clients)
- Support tools (support tickets, client feedback, impersonation mode for debugging)

**Dependencies:** Requires backend role system (platform_owner role), multi-tenant admin API endpoints, subscription management backend. This is a major architectural plan that spans both frontend and backend.

### Deferred (22+ stubs, backend-blocked)
These require backend Prisma models, controllers, and services before frontend can be built. Tracked in Deferred Stubs table above. Will be addressed as dedicated module-specific backend+frontend plans.

---

## Known Tech Debt

1. ~~**Header pattern drift**~~ — ✅ Resolved. 31 pages normalized via Plan C (C-1 through C-4)
2. ~~**Table styling drift**~~ — ✅ Resolved. S1-S4 structural fixes applied across all Plan C batches
3. **Missing shared components** — LoadingSpinner, FilterPills not yet extracted
4. ~~**DashboardHeader.tsx + GlassCard.tsx**~~ — ✅ Deleted in Plan D (dead code). Main dashboard already built via OwnerDashboard.tsx (18KB, fully functional). Actual blockers: 5 ComingSoon stubs need chart library + domain visualizations
5. **108 HaypDataTable pages** (Expenses, Sales) — Different pattern, intentionally not unified
6. **Employees page** — Uses `gray-*`, raw `fetch()`, `Loader2` — needs full rebuild (C-5 deferred)
7. **3 custom detail pages** — chart-of-accounts, journal-entries/[id], budgets/[budgetId] — too custom for Plan C
8. **Backend schema drift** — TimeEntry, TimerSession, ProjectMilestone field name mismatches
9. ~~**Reporting URL convention mismatch** — `reporting.service.ts` uses `/companies/${companyId}/reporting/*` but all existing reporting pages and the backend controller use `/reporting/*` with `companyId` as query param. Frontend pages will 404 until fixed.~~ — ✅ Resolved (L-2, commit 0957d91e)
10. ~~**Reporting error states not rendered** — 6 category report pages capture `error` state but never render it in JSX. Errors are silently swallowed.~~ — ✅ Resolved (L-2, commit 0957d91e)
11. **Reporting backend endpoints missing** — 6 category reports, 6 CSV exports, custom-reports CRUD, scheduled-reports CRUD endpoints don't exist on backend. Same category as 22 deferred stubs.
12. ~~**Heavy `any` typing in reporting service**~~ — ✅ Resolved (N-3, commit `a323f5fc`)
13. ~~**Dead code: 8 unused component files** — Toaster.tsx, CenteredModal.tsx, Breadcrumbs.tsx, BackButton.tsx, BackBar.tsx, StatusBadge.tsx (root-level), layout/tabs/SectionTabBar.tsx, layout/tabs/SectionBreadcrumb.tsx — all have zero imports~~ — ✅ Resolved (N-2, commit 2c11c32d)
14. ~~**Dual toast systems** — ToastProvider.tsx (canonical, 40+ consumers) and ui/Toast.tsx (4 expenses layouts) export same names with different APIs and z-indices; Toaster.tsx (third, dead code) pollutes window global~~ — ✅ Resolved (N-2, commit c9b450e8)
15. ~~**TopBar.tsx has non-functional buttons** — "PORTFOLIO", "TASK REMINDER", "RECONCILE ACCOUNTS" are decorative (onClick does nothing); user menu links are `href="#"` to non-existent pages~~ — ✅ Resolved (N-2, commit 69f856ad)
16. ~~**HaypReportTable customize panel is cosmetic** — Number format, show cents, negative format, row height toggles don't affect rendering; console.log left in production code~~ — ✅ Resolved (N-2, commit 2c11c32d)
17. ~~**Three "coming soon" components**~~ — ✅ Resolved (N-3, commit `a323f5fc`)
18. ~~**OwnerSidebar has dead Star import**~~ — ✅ Resolved (N-3, commit `a323f5fc`)
19. ~~**HaypDataTable.types.ts has dead tanstack imports**~~ — ✅ Resolved (N-3, commit `a323f5fc`)
20. ~~**JE attachments are discarded on create/edit** — File input only increments `attachmentCount`; actual files never uploaded to backend. journal-entries/new and journal-entries/[id] both affected. (Accounting audit #1, #3)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
21. ~~**JE customerId silently dropped from payload** — Form collects customer per line but `validLines.map()` only sends accountId/debit/credit/description. (Accounting audit #2)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
22. ~~**COA modal drops 4 form fields on save** — handleSave sends only {code, name, type}; parentId, description, isHeader, normalSide collected in form are silently discarded. (Accounting audit #4)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
23. ~~**console.log leaks financial data** — journal-entries/new page logs full JE payload (amounts, accounts) to browser console. 3 more in GeneralLedgerPage. (Accounting audit #5, #6)~~ — ✅ Resolved (N-1, commit 3aee1f1e)
24. ~~**Contra account styling never applies** — `getTypeRowStyle` checks `CONTRA_` (underscore) but types use spaces (`Contra Asset`). Falls through to gray. (Accounting audit #7)~~ — ✅ Resolved (N-2, commit 69f856ad)
25. ~~**Recurrence next-run always +1 month** — Yearly/Quarterly JEs show next run as next month regardless of interval. (Accounting audit #8)~~ — ✅ Resolved (N-2, commit 69f856ad)
26. ~~**JE void has no reason UI** — Hardcoded `{reason:'Voided by user'}`; Post action has no confirmation dialog. (Accounting audit #13, #14)~~ — ✅ Resolved (N-2, commit 69f856ad)
27. ~~**COA CSV import swallows per-row errors** — Failed imports reported as successful. (Accounting audit #16)~~ — ✅ Resolved (N-2, commit 69f856ad)
28. **Inconsistent API verbs** — Account deactivate uses DELETE, reactivate uses PUT for same state toggle. (Accounting audit #17)
29. ~~**30+ `as any` / `catch (e: any)` in accounting module**~~ — ✅ Resolved (N-3, commit `73ff563d`)

---

## Module Output Specifications

> **Purpose:** Every module section below defines its target output state — what "complete" looks like.
> Each module is evaluated against 11 perspectives. A module is ✅ Complete only when it satisfies
> all applicable criteria for its current phase.

### Evaluation Framework

Each module output spec is assessed from these perspectives:

| # | Perspective | Focus |
|---|---|---|
| 1 | **Accountant** | Logical flow, correct UI sequence, proper data entry, ledger accuracy, fully functional workflow, every button in the right place, understandable flow, no missing entry points |
| 2 | **Auditor** | Compliance readiness, audit trail integrity, discrepancy detection, data validation, segregation of duties, approval chains, traceability |
| 3 | **Security Analyst** | Input validation, authorization checks, sensitive data protection, CSRF/XSS prevention, secure file uploads, session handling |
| 4 | **UI Designer** | Consistent styling, no redundant buttons/forms, shared components reused, responsive layout, accessible markup, intuitive navigation, visual hierarchy |
| 5 | **Judgement** | Fair allocation rules, impartial calculations, correct tax treatment, proper period handling, ethical defaults |
| 6 | **Financial Analyst** | Accurate calculations, proper aggregation, drill-down capability, data completeness, period-over-period comparison support |
| 7 | **Business Analyst** | Business goal alignment, workflow efficiency, reporting coverage, decision-support data, integration points |
| 8 | **Backend Engineer** | Correct API endpoints, proper HTTP methods, query efficiency, error handling, pagination, idempotency where needed |
| 9 | **Frontend Engineer** | Component reusability, state management, error boundaries, loading states, form validation, URL-based navigation |
| 10 | **Folder Structure** | Logical file organization, consistent naming, co-located assets, no orphan files |
| 11 | **Testing** | DOM-testable components, verifiable outputs, no hardcoded test data in production, form submissions verifiable via DOM events |

---

### Accounting Module

**Target Output:** A fully functional double-entry accounting system that a CPA can use daily without workarounds.

**Sections & Deliverables:**

**1. Chart of Accounts (`/accounting/chart-of-accounts`)
- [ ] Hierarchical account tree with drag-and-drop reordering (parent/child relationships)
- [ ] Account types: Asset, Liability, Equity, Revenue, Expense, Contra Asset, Contra Liability, Contra Revenue — each with correct normal balance side (Debit/Credit) and signage
- [ ] Create, edit, archive, reactivate accounts with proper validation (no deletion of accounts with transactions)
- [ ] Account codes with format validation and uniqueness enforcement
- [ ] Import from CSV with row-level error reporting (failures array with per-row messages)
- [ ] Export to CSV with all account fields
- [ ] Search, filter by type, collapse/expand tree
- [ ] Visual distinction for contra accounts (e.g., indented or different icon)
- [ ] Header accounts (non-postable, organizational only) vs leaf accounts (postable)

**Accountant perspective:** Can the accountant find any account in under 3 clicks? Is the contra account visually distinguishable at a glance? Does the import handle errors gracefully without losing good rows? Is the hierarchy intuitive (indentation, expand/collapse)?

**Auditor perspective:** Is there an audit trail for account changes (who changed what, when)? Can accounts with balances be archived (should require approval)? Is there a log of CSV imports?

**UI Designer perspective:** Is the tree performance acceptable with 500+ accounts? Are action buttons (Edit, Archive, New) consistently placed? Does the table use shared HaypDataTable?

**Backend Engineer perspective:** Are COA endpoints RESTful? (`GET /chart-of-accounts`, `POST /chart-of-accounts`, `PUT /chart-of-accounts/:id`, `PATCH /chart-of-accounts/:id/archive`). Is the hierarchy stored with materialized path or adjacency list? Is the import endpoint idempotent?

**2. Journal Entries (`/accounting/journal-entries`)
- [ ] List page with search, filter by status (Draft, Posted, Voided), date range, and pagination
- [ ] Create new JE with dynamic line items (add/remove rows), auto-balancing validation (total debits = total credits)
- [ ] Each line: account selector (from COA), description, debit amount, credit amount — mutually exclusive (one must be zero)
- [ ] Customer/Vendor linkage per line (optional) for AR/AP tracking
- [ ] Attachment upload (multiple files) on create and edit, with file list display and delete capability
- [ ] Edit draft JEs (posted JEs are immutable — must void + re-enter)
- [ ] Post JE (with confirmation dialog — "This action cannot be undone")
- [ ] Void JE with mandatory rejection reason (modal, not `window.confirm`), stored for audit trail
- [ ] Recurring JE setup: frequency (Monthly/Quarterly/Yearly) with correct `nextRunDate` calculation (Monthly→+1mo, Quarterly→+3mo, Yearly→+12mo), start date, end date (optional)
- [ ] View JE detail: all line items, attachments, posting history, audit log
- [ ] Print/export JE as PDF

**Accountant perspective:** Is the auto-balance indicator real-time? Can the accountant see which accounts are debited vs credited at a glance? Is the customer selector accessible per line? Does the recurrence UI clearly show the next run date? Is the void flow clear about consequences?

**Auditor perspective:** Is every JE mutation (create, edit, post, void) logged with timestamp + user? Can voided JEs still be viewed with the void reason? Is the approval chain enforced (draft → posted, no skipping)?

**Security Analyst perspective:** Are attachment uploads validated for file type and size? Is the void endpoint authorization-checked (only authorized users can void)? Is customer data properly scoped to the company?

**Frontend Engineer perspective:** Does the form use ModalForm (canonical) not HaypModal for form modals? Are loading states shown during save/post? Is the line-items array managed with proper React state (no stale closures)?

**3. General Ledger (`/accounting/general-ledger`)
- [ ] Filterable ledger view by account, date range, transaction type
- [ ] Shows running balance per account (debit/credit/running total)
- [ ] Drill-down from any balance to source JE
- [ ] Export to CSV/PDF
- [ ] Supports multi-currency display when applicable

**Accountant perspective:** Is the running balance recalculated correctly after every transaction? Can the accountant trace any balance back to its source journal entry? Are debits shown positive and credits negative (or clearly labeled)?

**Financial Analyst perspective:** Can the ledger data be aggregated for period-over-period analysis? Are there summary views (monthly, quarterly)?

**4. Trial Balance (`/accounting/trial-balance`)
- [ ] Lists all accounts with their debit/credit balances for a selected period
- [ ] Total debits must equal total credits (with visual indicator)
- [ ] Filter by date range, account type
- [ ] Export to CSV/PDF
- [ ] Drill-down to individual account activity

**Accountant perspective:** Does the trial balance clearly show out-of-balance conditions? Is the period selector intuitive? Can the accountant quickly identify which accounts have unexpected balances?

**Auditor perspective:** Is the trial balance generated from live data (not cached/stale)? Can it be locked for a specific period-end date?

**5. Accounting Periods (`/accounting/accounting-periods`)
- [ ] Fiscal year management: create, open, close periods
- [ ] Period locking: prevent posting to closed periods
- [ ] Multi-year support with carry-forward
- [ ] Visual calendar/timeline of period status (Open, Closed, Closing)

**Accountant perspective:** Is the period lock status immediately visible? Does the system prevent posting to closed periods with a clear error message? Can the accountant see the full fiscal year timeline?

**Judgement perspective:** Are period-end close procedures documented/enforced? Is there a soft-close vs hard-close distinction?

**6. Asset Management (`/accounting/asset-management`)
- [ ] Fixed asset register: create assets with purchase date, cost, useful life, salvage value, depreciation method
- [ ] Depreciation schedules: Straight-line, Declining balance, Double declining
- [ ] Asset lifecycle: acquisition → depreciation → disposal/revaluation
- [ ] Asset categories with default depreciation rules

**Accountant perspective:** Is the depreciation calculation transparent (show the formula)? Can the accountant override a depreciation entry? Is the disposal flow clear (gain/loss calculation)?

**Financial Analyst perspective:** Are asset values tracked at both book value and fair market value? Can asset reports be generated by category, department, or location?

**7. Multi-Currency (`/accounting/multi-currency-revaluation`)
- [ ] Support for multiple currencies with exchange rate management
- [ ] Automatic revaluation of foreign currency balances
- [ ] Gain/loss recognition on revaluation

**Accountant perspective:** Are exchange rates current and source-able? Is the revaluation journal entry automatically generated and reviewable?

**8. Budget Management (`/accounting/budgets`)
- [ ] Budget creation by account, department, or project
- [ ] Budget vs actual comparison reports
- [ ] Variance analysis with threshold alerts

**Accountant perspective:** Can budgets be imported from CSV? Is the variance calculation transparent? Can the accountant drill from a variance to the underlying transactions?

**9. Close & Archive (`/accounting/close-archive`)
- [ ] Year-end close checklist with step-by-step flow
- [ ] Income/expense account closing to retained earnings
- [ ] Archive closed periods with read-only access

**Accountant perspective:** Is the close process guided (step 1, step 2, ...)? Can the accountant undo a close if needed (with appropriate authorization)? Is the archive searchable?

**Current Status:** 7 pages fully built. **Gaps:** 3 allocation stubs (cost-center, project, class), no PDF export, no year-end close automation, no budget vs actual reporting, no asset depreciation auto-scheduling.

---

### Banking Module

**Target Output:** Complete bank account management with reconciliation, transfers, and transaction tracking.

**Sections & Deliverables:**

**1. Bank Accounts (`/banking/accounts`)
- [ ] Register bank accounts with type (Checking, Savings, Credit Card, Petty Cash), currency, opening balance
- [ ] Link bank accounts to GL accounts (Chart of Accounts)
- [ ] View account balances, recent transactions
- [ ] Activate/deactivate accounts

**Accountant perspective:** Is the GL account linkage enforced (must select a valid COA account)? Is the opening balance entry automatically created as a JE? Can the accountant see which bank account maps to which GL account at a glance?

**Backend Engineer perspective:** Are bank account balances cached and updated transactionally? Is there a race condition risk between bank transaction import and manual entry?

**2. Bank Reconciliation (`/banking/reconciliation`)
- [ ] Start reconciliation for a bank account + period
- [ ] Import bank statement (CSV, OFX)
- [ ] Auto-match transactions (by amount, date, reference)
- [ ] Manual match: select bank transaction + internal transaction to pair
- [ ] Add missing transactions directly during reconciliation
- [ ] Clear/unclear individual transactions
- [ ] Complete reconciliation with discrepancy report
- [ ] View reconciliation history

**Accountant perspective:** Is the auto-match accuracy high? Can the accountant easily find unmatched items? Is the running cleared balance visible in real-time? Does the reconciliation clearly show the difference between bank balance and book balance? Can the accountant add a bank fee or interest entry without leaving the reconciliation screen?

**Auditor perspective:** Is every reconciliation saved with timestamp, user, and matched pairs? Can prior reconciliations be viewed but not edited? Is there a reconciliation discrepancy threshold that triggers a review?

**UI Designer perspective:** Is the match interface intuitive (click two items to pair)? Are matched items visually distinct from unmatched? Is there a split-screen layout (bank side vs book side)?

**3. Bank Transfers (`/banking/transfers`)
- [ ] Transfer between internal bank accounts
- [ ] Auto-generate JE for the transfer (debit destination, credit source)
- [ ] Record transfer fees
- [ ] Transfer status tracking (Pending, Completed, Failed)

**Accountant perspective:** Does the auto-generated JE use the correct GL accounts? Is the fee handling clear (separate JE line for fee expense)? Can the accountant edit the auto-generated JE before posting?

**4. Transaction Rules (`/banking/transaction-rules`)
- [ ] Auto-categorization rules for imported transactions
- [ ] Rule conditions: amount range, description contains, counterparty
- [ ] Rule actions: assign category, assign account, flag for review

**Business Analyst perspective:** Can rules be ordered by priority? Is there a test/preview function for rules? Can rules be enabled/disabled without deletion?

**Current Status:** Core pages built. **Gaps:** No actual bank feed integration (imports only), auto-match algorithm is basic, no recurring transfer scheduling, no bank fee auto-categorization.

---

### Sales Module

**Target Output:** End-to-end sales pipeline from quote to cash receipt with tax, discount, and inventory integration.

**Sections & Deliverables:**

**1. Customers (`/sales/customers`)
- [ ] Customer master data: name, email, phone, billing address, shipping address, tax ID, credit limit, payment terms
- [ ] Customer portal settings (optional)
- [ ] Customer statements (account receivable aging)
- [ ] Customer contact persons (multiple per customer)
- [ ] Notes and communication log

**Accountant perspective:** Is the customer aging report accurate (30/60/90 days)? Can the accountant view a customer's full transaction history? Is the credit limit enforced at invoice creation? Are payment terms (Net 30, Net 60, etc.) configurable per customer?

**UI Designer perspective:** Is the customer list searchable by all fields? Is the customer detail page tabbed (Details, Transactions, Statements, Notes)?

**2. Estimates / Quotes (`/sales/estimates`)
- [ ] Create estimates with line items (product/service, description, quantity, rate, discount, tax)
- [ ] Estimate status flow: Draft → Sent → Accepted → Rejected → Expired → Converted to Invoice
- [ ] Send estimate via email
- [ ] Convert accepted estimate to invoice (one click)
- [ ] Estimate templates with customizable branding
- [ ] Clone estimate for revision

**Accountant perspective:** Does the estimate total calculate correctly (subtotal - discount + tax = total)? Can the accountant see which estimates were converted vs expired? Is the conversion to invoice seamless (no data loss)?

**Business Analyst perspective:** Is there an estimate-to-conversion rate metric? Can expired estimates be followed up automatically?

**3. Invoices (`/sales/invoices`)
- [ ] Create invoices from scratch, from estimate, or from recurring schedule
- [ ] Line items with product/service selection, quantity, rate, discount type (% or flat), tax calculation
- [ ] Multiple tax rates per invoice (e.g., GST + PST)
- [ ] Invoice status flow: Draft → Sent → Paid → Partially Paid → Overdue → Voided
- [ ] Payment application: record partial or full payments against invoices
- [ ] Late fee calculation (auto or manual)
- [ ] Credit memo creation and application
- [ ] Invoice printing with professional layout (header, logo, terms, footer)
- [ ] Batch actions: send multiple, print multiple, export multiple
- [ ] Recurring invoice scheduling

**Accountant perspective:** Is the tax calculation transparent (show each tax line separately)? Can the accountant apply a payment to multiple invoices (oldest first)? Is the credit memo flow correct (reduce AR, not create negative invoice)? Does the invoice print layout include all legally required information?

**Auditor perspective:** Is every invoice mutation logged? Can deleted/voided invoices be recovered? Is the payment-to-invoice mapping traceable? Are tax calculations auditable (stored, not recalculated)?

**Security Analyst perspective:** Are customer financial data (credit limits, aging) access-controlled? Is invoice PDF generation server-side (prevent tampering)?

**UI Designer perspective:** Is the invoice form responsive? Are line items in a proper data table with add/remove/reorder? Is the payment recording inline (no page navigation)?

**4. Recurring Invoices (`/sales/recurring-invoices`)
- [ ] Schedule automatic invoice generation (daily, weekly, monthly, yearly)
- [ ] Template management (line items, amounts, tax)
- [ ] Customer assignment
- [ ] Start/end date, next run date
- [ ] Pause/resume schedule
- [ ] History of generated invoices

**Accountant perspective:** Is the next run date calculated correctly for each frequency? Can the accountant preview the next invoice before it generates? Is there a notification when a recurring invoice fails?

**5. Credit Notes (`/sales/credit-notes`)
- [ ] Create credit notes against invoices or standalone
- [ ] Refund tracking (full, partial, none)
- [ ] Apply credit note to future invoices
- [ ] Print credit note

**Accountant perspective:** Does the credit note properly reverse the tax entries? Is the AR impact clear (reduce AR, not create negative revenue)? Can the accountant see the original invoice from the credit note?

**6. Sales Reports (`/sales/reports` or via Reporting Center)
- [ ] Sales by customer, product, period
- [ ] Revenue recognition tracking
- [ ] Accounts receivable aging
- [ ] Top customers by revenue
- [ ] Sales trend analysis

**Financial Analyst perspective:** Are reports filterable by date range, customer, product? Can reports be exported to CSV/PDF? Are there visual charts (bar, line) for trends?

**Current Status:** Core pages built (Customers, Invoices, Estimates, Credit Notes, Recurring). **Gaps:** No actual email sending (UI exists, backend not wired), no payment gateway integration, no inventory deduction on invoice, no multi-currency invoicing, no invoice template customization.

---

### Expenses Module

**Target Output:** Complete purchase-to-pay cycle with vendor management, bill approval, payment processing, and expense tracking.

**Sections & Deliverables:**

**1. Vendors (`/expenses/vendors`)
- [ ] Vendor master data: name, email, phone, address, tax ID, payment terms, bank details, 1099 status
- [ ] Vendor contact persons (multiple)
- [ ] Vendor portal settings
- [ ] Notes and communication log
- [ ] Vendor statements (AP aging)
- [ ] 1099 tracking and reporting (US tax)

**Accountant perspective:** Is the vendor aging report accurate? Can the accountant view a vendor's full purchase/payment history? Is the 1099 status trackable? Are payment terms enforced on bill creation?

**Auditor perspective:** Is vendor bank account information encrypted? Is there a vendor approval workflow before first use? Are 1099 amounts calculable at year-end?

**2. Bills (`/expenses/bills`)
- [ ] Create bills from purchase orders or from scratch
- [ ] Line items with account, description, quantity, rate, tax
- [ ] Bill status flow: Draft → Submitted → Approved → Paid → Partially Paid → Overdue → Voided
- [ ] Bill approval workflow (configurable: single approval, multi-level)
- [ ] Attach receipts/documents
- [ ] Record partial payments against bills
- [ ] Batch bill actions
- [ ] Recurring bill scheduling
- [ ] Bill printing with professional layout

**Accountant perspective:** Is the bill total calculation correct? Can the accountant see the approval chain? Is the payment-to-bill mapping traceable? Does the bill automatically create AP entry in GL? Can the accountant split a bill across multiple departments or projects?

**Auditor perspective:** Is there segregation of duties (creator ≠ approver)? Is every approval action logged? Can bills be modified after approval (should require re-approval)?

**UI Designer perspective:** Is the bill form consistent with the invoice form (sales module)? Are shared components used (line items table, tax calculator, attachment upload)?

**3. Payments (`/expenses/bills-payments`)
- [ ] Record payments to vendors (check, wire, ACH, credit card)
- [ ] Auto-apply payment to oldest outstanding bill
- [ ] Manual payment allocation (select which bills to pay)
- [ ] Payment status tracking
- [ ] Print checks (with MICR line, payee, amount, memo)
- [ ] Batch payment processing (pay multiple vendors at once)

**Accountant perspective:** Does the payment auto-generate the correct JE (credit Cash/Bank, debit AP)? Can the accountant see the payment history per vendor? Is early payment discount handling available (2/10 Net 30)? Is the check print layout professional and MICR-compliant?

**4. Purchase Orders (`/expenses/procurement`)
- [ ] Create POs with line items, vendor selection, delivery date
- [ ] PO status flow: Draft → Sent → Partially Received → Received → Closed → Cancelled
- [ ] Receive against PO (partial or full)
- [ ] Auto-convert received PO to bill
- [ ] PO approval workflow
- [ ] PO printing with terms and conditions

**Accountant perspective:** Does receiving against a PO create inventory entries? Is the PO-to-bill conversion seamless? Can the accountant track PO commitments vs actual spending?

**5. Employee Expenses (`/expenses/employee-expenses`)
- [ ] Employee expense submission (receipt upload, category, amount, date, description)
- [ ] Expense categories (Travel, Meals, Office, etc.) with per-category limits
- [ ] Approval workflow (manager approval, finance approval)
- [ ] Expense report generation (per employee, per department, per period)
- [ ] Reimbursement processing (create vendor payment or direct deposit)
- [ ] Corporate card transaction import and matching

**Accountant perspective:** Are expense categories aligned with the COA? Does approved expense auto-create a JE? Can the accountant see the full approval chain? Is the reimbursement flow traceable?

**Auditor perspective:** Are receipt images verified against claimed amounts? Is there a duplicate detection (same receipt submitted twice)? Are expense policy violations flagged?

**UI Designer perspective:** Is the receipt upload drag-and-drop? Is the mobile experience good (employees submit from phones)? Is the approval queue intuitive?

**6. Expense Reports (`/expenses/expense-reports`)
- [ ] Aggregate employee expenses into reports
- [ ] Report status flow: Draft → Submitted → Approved → Reimbursed → Rejected
- [ ] Report-level approval (approve all expenses at once)
- [ ] Export to PDF/CSV

**Current Status:** Core pages built (Vendors, Bills, Payments, Procurement, Employee Expenses). **Gaps:** No approval workflow enforcement, no check printing, no 1099 reporting, no corporate card integration, no PO-to-inventory integration, no multi-level approval chains.

---

### Inventory Module

**Target Output:** Complete inventory management with stock tracking, valuation, and sales/purchase integration.

**Sections & Deliverables:**

**1. Products & Services (`/inventory/products-services`)
- [ ] Product master: name, SKU, description, category, unit, price, cost, tax applicable
- [ ] Service items (non-inventory)
- [ ] Product categories with hierarchy
- [ ] Product images
- [ ] Bulk import/export (CSV)
- [ ] Product status (Active, Inactive, Discontinued)

**Accountant perspective:** Is the inventory asset account auto-populated from COA? Can the accountant set default COGS and revenue accounts per product category? Is the costing method configurable (FIFO, LIFO, Average)?

**2. Stock Management (`/inventory/stock-management`)
- [ ] Real-time stock levels per product per warehouse
- [ ] Stock adjustment (increase/decrease with reason)
- [ ] Stock transfer between warehouses/locations
- [ ] Low stock alerts with configurable thresholds
- [ ] Stock movement history (full audit trail)

**Accountant perspective:** Does every stock movement create a JE (debit/credit inventory accounts)? Is the stock valuation updated in real-time? Can the accountant view stock by valuation method?

**Auditor perspective:** Is every stock movement logged with user, timestamp, reason? Can stock adjustments be reversed? Is there a periodic stock count reconciliation feature?

**3. Warehouses (`/inventory/warehouses`)
- [ ] Warehouse creation with address, contact, manager
- [ ] Multiple warehouse support
- [ ] Warehouse-level stock tracking

**4. Inventory Valuation (`/inventory/valuation`)
- [ ] Valuation by FIFO, LIFO, Weighted Average
- [ ] Valuation report by product, category, warehouse
- [ ] Period-end valuation adjustment JE
- [ ] Inventory write-down handling

**Accountant perspective:** Is the valuation method change tracked (can't change mid-period without adjustment)? Does the write-down create the correct JE (debit COGS, credit Inventory)?

**5. Purchase & Sales Integration**
- [ ] Auto-deduct stock on invoice/sales order
- [ ] Auto-add stock on bill receipt/PO receipt
- [ ] Backorder handling (sell more than in stock)
- [ ] Inventory reservation for sales orders

**Current Status:** Core pages built. **Gaps:** No actual inventory tracking (backend), no warehouse management, no valuation reports, no FIFO/LIFO/Average cost methods, no stock alerts, no barcode/QR support.

---

### Payroll Module

**Target Output:** Full payroll processing with employee management, tax calculations, and compliance reporting.

**Sections & Deliverables:**

**1. Employees (`/payroll/employees`)
- [ ] Employee master: personal info, employment details, compensation, tax withholdings, bank details
- [ ] Employee categories (Full-time, Part-time, Contractor)
- [ ] Employment history (hire date, termination, rehire)
- [ ] Document management (W-4, I-9, contracts)
- [ ] Self-service portal (view paystubs, submit time-off)

**2. Payroll Runs (`/payroll/payroll-runs`)
- [ ] Create payroll run for a period (weekly, bi-weekly, semi-monthly, monthly)
- [ ] Auto-calculate gross pay, deductions, taxes, net pay
- [ ] Support for hourly and salaried employees
- [ ] Overtime calculation (configurable thresholds)
- [ ] Bonus/commission processing
- [ ] Payroll preview before processing
- [ ] One-click payroll processing (generate paystubs, JEs, tax filings)
- [ ] Payroll reversal/correction

**Accountant perspective:** Are tax calculations correct (federal, state, local, FICA, Medicare)? Is the payroll JE correct (debit Wages Expense, credit Cash, credit Payroll Liabilities)? Can the accountant review and approve before processing?

**Auditor perspective:** Is every payroll run archived and immutable after processing? Are tax remittances tracked? Is there a segregation between payroll processor and approver?

**3. Tax & Compliance (`/payroll/tax-compliance`)
- [ ] Tax withholding setup (federal, state, local)
- [ ] Employer tax contributions (FICA match, FUTA, SUTA)
- [ ] Year-end forms (W-2, 1099)
- [ ] Tax filing status tracking
- [ ] Quarterly tax reports (941)

**4. Compensation & Benefits (`/payroll/compensation`)
- [ ] Salary/wage management
- [ ] Benefits enrollment (health, dental, vision, 401k)
- [ ] Benefit deduction processing
- [ ] PTO/leave management and accrual

**Current Status:** Mostly stubs. **Gaps:** Full rebuild needed — current Employees page is flagged for rebuild (Tech Debt #6), no actual payroll processing, no tax engine, no paystub generation.

---

### Projects Module

**Target Output:** Project-based accounting with budgeting, time tracking, and profitability analysis.

**Sections & Deliverables:**

**1. Projects (`/projects/projects`)
- [ ] Project creation: name, customer, start/end date, budget, manager, status
- [ ] Project status flow: Planning → Active → On Hold → Completed → Cancelled
- [ ] Project dashboard: budget vs actual, timeline, team, milestones

**2. Time Tracking (`/projects/time-tracking`)
- [ ] Log time entries (project, task, date, hours, description)
- [ ] Timer (start/stop) for real-time tracking
- [ ] Weekly timesheet view
- [ ] Approve/reject timesheets
- [ ] Billable vs non-billable hours

**3. Project Invoicing (`/projects/project-invoicing`)
- [ ] Generate invoices from time entries and expenses
- [ ] Progress billing (percentage of completion)
- [ ] Milestone-based invoicing
- [ ] Retention/warranty holdback

**4. Project Reports (`/projects/reports` or via Reporting Center)
- [ ] Project profitability (revenue - cost - overhead)
- [ ] Budget vs actual by project, phase, category
- [ ] Resource utilization (hours billed vs available)
- [ ] Project timeline (Gantt chart or similar)

**Financial Analyst perspective:** Are project costs fully loaded (labor + materials + overhead)? Is the profitability calculation transparent? Can reports be filtered by customer, manager, date range?

**Current Status:** Basic pages built. **Gaps:** No actual time tracking, no project budget tracking, no progress billing, no Gantt chart, no resource allocation.

---

### Reporting Module ✅ COMPLETE (L-1 + L-2)

**Target Output:** Comprehensive reporting suite with 20+ report types, custom report builder, and analytics dashboards.

**Sections & Deliverables:**

**1. Reports Center (`/reporting/reports-center`)
- [x] 6 category pages (Banking, Expense, Inventory, Payroll, Project, Sales) with report cards
- [x] Each card: title, description, run button
- [x] Error state with retry button
- [x] Consistent layout across all 6 pages

**2. Analytics Dashboards (`/reporting/analytics/analytics-dashboards`)
- [x] 4 KPI cards (Total Revenue, Total Expenses, Net Profit, Accounts Receivable)
- [x] Bar chart (Monthly Revenue vs Expenses) using recharts
- [x] Line chart (Profit Trend) using recharts
- [x] Mock data with `generateMockData` function

**3. Report Builder (`/reporting/custom-reports/report-builder`)
- [x] Two-column layout (form + preview)
- [x] Dynamic column selection
- [x] Filter configuration
- [x] Mock CSV download
- [x] Real-time preview

**4. Reporting Service (`src/services/reporting.service.ts`)
- [x] All 20 methods with correct URL pattern (`/reporting/*` with `{ params: { companyId } }`)
- [x] CSV exports use `buildQuery({ ...params, companyId })` + `downloadFromResponse`
- [x] Regular queries use `apiClient.get`/`apiClient.post`

**Gaps (backend-dependent):** All 20 report endpoints return 404 until backend implements them. Analytics dashboards use mock data. Report builder preview is mock.

---

### Settings Module

**Target Output:** Complete organization settings with user management, security, and customization.

**Sections & Deliverables:**

**1. Company Profile (`/settings/company-profile`)
- [ ] Company details: legal name, DBA, tax ID, address, phone, email, website, logo
- [ ] Fiscal year settings (start month, period count)
- [ ] Default currency, timezone, date format
- [ ] Multi-currency enable/disable

**2. User Management (`/settings/users-security`)
- [ ] Invite users (email, role assignment)
- [ ] Role-based access control (Admin, Accountant, Employee, Read-only)
- [ ] User activation/deactivation
- [ ] Password reset flow
- [ ] User activity log

**Security Analyst perspective:** Are passwords hashed with bcrypt/argon2? Is there rate limiting on login? Are sessions invalidated on password change? Is 2FA available and enforced for admin roles?

**3. Security Settings (`/settings/users-security/two-factor-auth`)
- [ ] Two-factor authentication (TOTP)
- [ ] Session management (view active sessions, revoke)
- [ ] IP whitelist (optional)
- [ ] Login history

**4. Preferences (`/settings/preferences`)
- [ ] Date format, number format, currency display
- [ ] Default payment terms
- [ ] Invoice template selection
- [ ] Notification preferences

**5. Tax Settings (`/settings/tax-settings`)
- [ ] Tax rate configuration (name, rate, agency)
- [ ] Compound tax support (tax on tax)
- [ ] Tax-exempt customer/vendor handling
- [ ] Tax filing calendar

**6. Integration Settings (`/settings/integrations`)
- [ ] Bank feed connection (Plaid, Yodlee)
- [ ] Payment gateway (Stripe)
- [ ] Email service (SendGrid)
- [ ] Cloud storage (R2/S3) for attachments

**Current Status:** UI pages built. **Gaps:** No actual user invitation flow (backend), no 2FA implementation, no bank feed connections, no payment gateway wiring.

---

### Tasks & Approvals Module

**Target Output:** Workflow automation with task management, approval queues, and notification system.

**Sections & Deliverables:**

**1. My Tasks (`/tasks-approvals/my-work/my-tasks`)
- [ ] Task list assigned to current user
- [ ] Task detail with description, due date, priority, status
- [ ] Mark complete, reassign, add notes
- [ ] Filter by status, priority, due date

**2. Approvals Queue (`/tasks-approvals/my-work/my-approvals`)
- [ ] Pending approvals (bills, expenses, POs, timesheets)
- [ ] Approve/reject with comments
- [ ] Batch approve
- [ ] Approval history

**3. Task Management (`/tasks-approvals/task-management`)
- [ ] Create tasks (assignee, due date, priority, description, linked entity)
- [ ] Task templates (recurring tasks)
- [ ] Task board (Kanban-style: To Do, In Progress, Done)

**Business Analyst perspective:** Can tasks be linked to any entity (invoice, bill, project, journal entry)? Is there a notification when a task is assigned or approved? Can task completion trigger automated actions (e.g., approve bill when manager approves)?

**Current Status:** Basic pages built. **Gaps:** No actual workflow engine, no notifications, no task templates, no Kanban board.

---

## Commit History

| Commit | Batch | Description |
|---|---|---|
| `df2623d4` | C-1 | Normalize 10 Inventory pages (11 systematic fixes) |
| `78f70968` | C-1-fix | Apply structural + date + search fixes to Inventory |
| `65119adc` | C-1-fix | Complete structural normalization for Inventory |
| `cc2365ac` | C-2 | Normalize 10 Tax pages (11 systematic fixes) |
| `351908ff` | C-2-fix | Structural fixes for 12 Tax module tables (S1/S2/S3/Fix6/Fix7/outer-div) |
| `89127632` | C-3 | Normalize 8 Accounting + Budgeting pages to Pattern A (15-fix recipe) |
| `389078fc` | C-4 | Normalize 3 special case inventory files (lot-serial-tracking, inventory-valuation, bin-locations) |
| `c4698373` | docs | Update Road_Map.md — Plan C complete, condense and align metrics |
| `ab5a289b` | D | Remove dead code, fix ComingSoonPage palette drift, remove stale config |
| `2e0352b9` | docs | Update Road_Map.md — add Plan D, fix tech debt #4 |
| `b5349eeb` | security | Change RBAC default role from 'admin' to 'viewer' |
| `fc7a9e4b` | E-1 | Add tasks-approvals service, domain types, my-approvals page |
| `c55ea3fe` | E-2 | Build 4 my-work list pages |
| `27a3aba1` | E-3 | Build 5 management list pages, module complete |
| `1b302b7e` | F-1 | Establish form gold standard with company-details & fiscal-year-setup |
| `a6c16011` | F-2 | Table+modal pattern with numbering-sequences, custom-fields, data-backup |
| `bfe3e938` | F-3 | User security pages, Settings module complete (12/12) |
| `7f9a3a2c` | docs | Consolidate roadmap — Plan F complete, Settings to Completed Modules |
| `4e1b87d5` | G-1 | Add compliance service + internal-controls, control-testing, policy-management |
| `19bbf943` | G-1-fix | Remove as const from constant arrays to fix tsc errors |
| `5296439c` | G-2 | Add monitoring pages — issue-tracking and fraud-detection-rules |
| `6b6d4b6e` | docs | Consolidate roadmap — Plan G complete, Compliance to Completed Modules |
| `168cee6b` | H | Add statement archive + client requests pages (Banking + Accountant Workspace complete) |
| `650f64ab` | docs | Consolidate roadmap — Plan H complete, Banking and Accountant Workspace to Completed Modules |
| `112e699f` | I-1 | Add automation service + workflow/rules/ai-bookkeeping pages |
| `27065d18` | I-2 | Add smart-matching, automation-logs, error-queue pages (Automation complete) |
| `4c626883` | docs | Consolidate roadmap — Plan I complete, Automation to Completed Modules |
| `a391baac` | J-1 | Create integration service + api-keys, webhooks, installed-apps, integration-logs |
| `fd225b02` | J-2 | Export-data, import-data, app-marketplace, developer-sandbox (Integrations complete) |
| `6b8f0a7d` | docs | Consolidate roadmap — Plan J complete, Integrations to Completed Modules |
| `23aa6c85` | K-1 | Setup-center, shortcuts, notifications (3 chart-free dashboard pages) |
| `a1f55791` | K-2 | Install recharts + business-health and performance dashboard pages |
| `a5c79d8b` | docs | Consolidate roadmap — Plan K complete, Home Dashboard to Completed Modules |
| `62e6396f` | L-1 | feat(reporting): add reporting service + 8 pages — L-1 (6 category reports + 2 CRUD) |
| `3b054483` | docs | Add Cloudflare R2 + detailed deployment guide to roadmap |
| `8979e51b` | docs | Add Section 1 audit findings + HB_Owner architectural plan to roadmap |
| `fb813da4` | docs | Add accounting module audit findings (30 issues) to roadmap |
| `0957d91e` | L-2 | feat(reporting): complete L-2 — fix URL convention, error rendering, add analytics dashboards + report builder |
| `3aee1f1e` | N-1 | fix(accounting): N-1 critical hotfixes — attachment upload, customerId payload, COA modal fields, remove console.logs |
| `11274edb` | docs | chore: clean up working tree — remove Vite prototype docs, ignore root clutter |
| `a48c1f67` | docs | docs: update roadmap metrics (347 pages, 72 commits ahead, 3 missing history entries) |
| `483eb6c4` | docs | docs: update roadmap — L-2 + N-1 complete, 6 tech debt items resolved, N-2 shaped |
| `2c11c32d` | N-2 | chore: delete 8 dead component files + clean up HaypReportTable cosmetic panel |
| `c9b450e8` | N-2 | refactor(toast): merge dual toast systems into canonical ToastProvider |
| `69f856ad` | N-2 | fix(accounting): N-2 UX improvements — void reason, post confirm, recurrence, contra styling, CSV errors, TopBar buttons |
| `ab79e6bb` | docs | docs: update roadmap — N-2 complete, 8 tech debt items resolved, N-3 shaped |
| `87d3ff52` | docs | docs: add module output specifications with 11-perspective evaluation framework |
| `73ff563d` | N-3 | refactor(accounting): replace 'as any' casts with proper TypeScript types |
| `a323f5fc` | N-3 | refactor: remove dead code and consolidate coming-soon components |

## Deployment Roadmap

### Tagline
"HaypBooks — the heartbeat of your business"

### Stack
| Service | Purpose | Provider |
|---|---|---|
| Frontend | Next.js app, auto-deploys from GitHub | Vercel |
| Backend | API server, connects to Neon | Render.com |
| Database | Serverless PostgreSQL | Neon |
| Email | Transactional emails (invoices, receipts, notifications) | SendGrid |
| File Storage | Attachment uploads (receipts, documents, invoices) | Cloudflare R2 |
| DNS | Domain management | Porkbun (haypbooks.com) |

### ⚠️ Deployment Prerequisites
Before deploying, the following backend code changes are required:

1. **R2 Integration (REQUIRED — Render has an ephemeral filesystem)**
   - Render's filesystem is ephemeral — files saved to local disk are **lost on every deploy or restart**
   - The current backend uses multer `diskStorage` saving to `uploads/attachments/` — this will NOT work on Render
   - Required changes:
     - Install `@aws-sdk/client-s3` in Backend (`npm install @aws-sdk/client-s3`)
     - Replace multer `diskStorage` with S3-compatible upload in `attachments.controller.ts` using the R2 endpoint
     - Add R2 env vars to `Haypbooks/Backend/.env.production.example`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
     - Update the `fileUrl` stored in database from local path to R2 public URL
   - This should be completed as a dedicated task before production deployment

### Deployment Order
1. **Neon** → Create database, get connection string, run migrations
2. **Cloudflare R2** → Create bucket, get credentials, configure CORS
3. **Render** → Deploy backend, set all env vars (including R2 vars after integration)
4. **SendGrid** → Get API key, configure domain authentication
5. **Vercel** → Connect GitHub repo, set env vars, deploy
6. **Porkbun** → Configure all DNS records (Vercel, Render, SendGrid, R2)
7. **Testing** → End-to-end verification of all integrations

### Environment Variables
Source of truth: `Haypbooks/Backend/.env.production.example` and `Haypbooks/Frontend/.env.local.example`.

**Critical production overrides** (set in each platform's dashboard, never committed to git):

**Backend (Render):**
| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://[user]:[pass]@[host]/[db]?sslmode=require` | From Neon dashboard |
| `SENDGRID_API_KEY` | `SG.xxxxxxxxxxxx` | From SendGrid dashboard |
| `SENDGRID_FROM` | `noreply@haypbooks.com` | Verified sender in SendGrid |
| `JWT_SECRET` | Random 64-char string | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Random 64-char string | Generate with `openssl rand -hex 32` |
| `HMAC_KEY` | Random 64 hex chars | Phone number hashing — `openssl rand -hex 32` |
| `FIELD_ENCRYPTION_KEY` | Random 64 hex chars | Sensitive field encryption — `openssl rand -hex 32` |
| `CORS_ORIGINS` | `https://haypbooks.com` | Frontend URL |
| `FRONTEND_URL` | `https://haypbooks.com` | Used in email links and CORS |
| `PORT` | `4000` | Backend port |
| `R2_ACCOUNT_ID` | Cloudflare account ID | From R2 dashboard — **requires backend R2 integration first** |
| `R2_ACCESS_KEY_ID` | R2 API access key | From R2 dashboard → Manage R2 API Tokens — **requires backend R2 integration first** |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key | From R2 dashboard → Manage R2 API Tokens — **requires backend R2 integration first** |
| `R2_BUCKET_NAME` | `haypbooks-attachments` | Your bucket name — **requires backend R2 integration first** |
| `R2_PUBLIC_URL` | `https://attachments.haypbooks.com` | Public URL for uploaded files — **requires backend R2 integration first** |

**Frontend (Vercel):**
| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.haypbooks.com` | Backend API URL |
| `NEXT_PUBLIC_USE_MOCK_API` | `false` | Must be false in production |
| `NEXT_PUBLIC_ENABLE_TAGS` | `true` | Feature flag |
| `NEXT_PUBLIC_SITE_URL` | `https://haypbooks.com` | Used by server-url.ts |

---

### Step-by-Step Deployment Guide

#### 1. Neon — Database Setup
1. Go to [neon.tech](https://neon.tech) and sign up / log in
2. Click **"Create Project"**
3. Name it `haypbooks-db`, choose the closest region to your users
4. Select **"Plan"** — Free tier is fine to start, upgrade as needed
5. After creation, copy the **connection string** (format: `postgresql://[user]:[pass]@[ep-xxx].us-east-2.aws.neon.tech/[db]?sslmode=require`)
6. Go to the **"Branches"** tab — ensure you have a `main` branch (default)
7. Go to **"Connection Pooling"** (under Settings) — enable it for better performance. The pooled connection string uses port `5432` with `-pooler` in the hostname
8. Save the connection string — you'll need it for Render env vars
9. **For Prisma migrations:** After deploying Render, SSH into the Render service or run locally with the production DATABASE_URL:
   ```
   npx prisma migrate deploy
   ```

#### 2. Cloudflare R2 — File Storage Setup
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up / log in
2. In the left sidebar, click **"R2 Object Storage"**
3. Click **"Create Bucket"**
4. Bucket name: `haypbooks-attachments` (must be globally unique)
5. Choose the closest location to your users
6. After creation, go to the bucket **Settings** tab
7. **Configure CORS policy:**
   - Go to Settings → CORS Policy
   - Add the following CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["https://haypbooks.com", "https://www.haypbooks.com"],
       "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 86400
     }
   ]
   ```
8. **Get API credentials:**
   - Go to R2 → **Manage R2 API Tokens** (top right)
   - Click **"Create API Token"**
   - Permissions: **Object Read & Write**
   - Specify bucket: `haypbooks-attachments` (or apply to all)
   - Copy the **Access Key ID** and **Secret Access Key** — save these securely
   - Also note your **Cloudflare Account ID** (visible in the R2 dashboard URL or any API token page)
9. **(Optional) Custom domain for attachments:**
   - In the bucket settings, go to **"Custom Domains"**
   - Click **"Connect Domain"** → enter `attachments.haypbooks.com`
   - Cloudflare will provide DNS records to add at Porkbun (see step 6)
10. **Note:** R2 bucket setup can be done now, but the **backend code integration** (replacing multer diskStorage with S3 upload) must be completed before uploads will work in production. See "Deployment Prerequisites" above.

#### 3. Render — Backend Deployment
1. Go to [render.com](https://render.com) and sign up / log in (GitHub SSO recommended)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository (`Janpolescuadra25/HaypBooks`)
4. **Configure the service:**
   - **Name:** `haypbooks-api`
   - **Root Directory:** `Haypbooks` (monorepo root — required because Backend's package.json has `"haypbooks-frontend": "file:../Frontend"`)
   - **Build Command:** `cd Backend && npm install && npm run build`
   - **Start Command:** `cd Backend && node dist/main.js`
   - **Instance Type:** Free to start (Starter $7/mo recommended for production — free tier spins down after 15 min inactivity causing ~30s cold starts, and **has an ephemeral filesystem** so local file uploads are lost on every deploy)
5. **Environment variables** — Add ALL backend env vars from the table above (DATABASE_URL, SENDGRID_API_KEY, JWT_SECRET, etc.)
   - Add R2 vars only after completing the backend R2 integration (see Prerequisites)
6. Click **"Create Web Service"**
7. Wait for the build to complete. Monitor the build logs for errors.
8. After successful deploy, copy the service URL (e.g., `https://haypbooks-api.onrender.com`)
9. **If build fails:** Common issues:
    - TypeScript errors — run `cd Backend && npx tsc --noEmit` locally to check
    - Missing env vars at build time — some build steps may need vars set early
    - Monorepo path issue — verify root directory is `Haypbooks`, not `Haypbooks/Backend`

#### 4. SendGrid — Email Setup
1. Go to [sendgrid.com](https://sendgrid.com) and sign up (free tier allows 100 emails/day)
2. Complete account verification (email confirmation)
3. Go to **Settings** → **Sender Authentication**
4. **Domain Authentication (recommended over single sender):**
   - Click **"Get Started"** under "Domain Authentication"
   - Enter domain: `haypbooks.com`
   - SendGrid will generate DNS records (TXT and CNAME records for SPF and DKIM)
   - **Do NOT add these to Porkbun yet** — do it in step 6 alongside all other DNS records
5. **Single Sender Verification (quick alternative):**
   - Go to Settings → **Sender Authentication** → **Single Sender Verification**
   - Add: `noreply@haypbooks.com`
   - SendGrid will send a verification email — click the link
6. **Get API Key:**
   - Go to **Settings** → **API Keys**
   - Click **"Create API Key"**
   - Name: `HaypBooks Production`
   - Permissions: **Restricted Access** → select "Mail Send" → "Full Access"
   - Copy the API key (shown only once) — add to Render env vars as `SENDGRID_API_KEY`

#### 5. Vercel — Frontend Deployment
1. Go to [vercel.com](https://vercel.com) and sign up / log in (GitHub SSO recommended)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository (`Janpolescuadra25/HaypBooks`)
4. **Configure the project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** Click "Edit" → select `Haypbooks/Frontend`
   - **Build Command:** `npm run build` (default, should auto-detect)
   - **Output Directory:** Leave default (`.next`)
5. **Environment Variables** — Add ALL frontend env vars from the table above (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_USE_MOCK_API=false, etc.)
6. Click **"Deploy"**
7. Wait for the build to complete
8. After deploy, Vercel assigns a preview URL (e.g., `haypbooks-frontend.vercel.app`)
9. Go to **Project Settings** → **Domains**
10. Add: `haypbooks.com` and `www.haypbooks.com`
11. Vercel will show DNS records needed — add them at Porkbun in step 6

#### 6. Porkbun — DNS Configuration
1. Go to [porkbun.com](https://porkbun.com) and log in
2. Go to your domain `haypbooks.com` → **DNS Management**
3. **Remove any existing records** that conflict with the ones below (check carefully)

4. **Add Vercel records:**
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | A | `@` | `76.76.21.21` | Points haypbooks.com to Vercel |
   | CNAME | `www` | `cname.vercel-dns.com` | Points www subdomain to Vercel |

5. **Add Render record:**
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | CNAME | `api` | `haypbooks-api.onrender.com` | Points api.haypbooks.com to Render backend |

6. **Add SendGrid records** (from SendGrid Dashboard → Settings → Sender Authentication → your domain → "View DNS Records"):
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | TXT | `@` | (from SendGrid) | SPF record — copy exact value from SendGrid dashboard |
   | CNAME | (from SendGrid) | (from SendGrid) | DKIM record 1 — copy exact hostname and value from SendGrid |
   | CNAME | (from SendGrid) | (from SendGrid) | DKIM record 2 — copy exact hostname and value from SendGrid |
   | CNAME | (from SendGrid) | (from SendGrid) | DKIM record 3 — copy exact hostname and value from SendGrid |

   **Important:** SendGrid generates unique DNS records per domain. Do NOT guess the values — always copy the exact hostnames and values from your SendGrid dashboard's "View DNS Records" button.

7. **Add Cloudflare R2 records** (if using custom domain for attachments):
   | Type | Name | Value | Notes |
   |---|---|---|---|
   | CNAME | `attachments` | (from Cloudflare R2 custom domain setup) | Provided in R2 bucket settings → Custom Domains |

8. **Wait for DNS propagation** — can take up to 48 hours, usually 5-30 minutes

9. **Verify DNS:** Use [dnschecker.org](https://dnschecker.org) to check each record

#### 7. Post-Deployment Testing
After all DNS records propagate, verify each service:

- **Frontend:** Visit `https://haypbooks.com` — should load the HaypBooks app
- **Backend API:** Visit `https://api.haypbooks.com/api` or any health endpoint — should return a response (not a browser error)
- **Auth flow:** Sign up / log in on the frontend — should hit the backend API successfully
- **Database:** Create a test company after login — data should persist (verify by refreshing)
- **Email:** Trigger a transactional email (e.g., send an invoice) — check email arrives at the recipient
- **File upload:** Upload a receipt/attachment — **requires R2 backend integration first** (see Prerequisites). After integration, verify file is stored in R2 and retrievable via the public URL
- **CORS:** Verify no CORS errors in browser console (both frontend↔backend and frontend↔R2)

### Render Deployment Note
The backend has a monorepo dependency (`"haypbooks-frontend": "file:../Frontend"` in Backend's package.json). The Render service root must be set to `Haypbooks/` (the monorepo root, not `Haypbooks/Backend/`). Build command: `cd Backend && npm install && npm run build`. Start command: `cd Backend && node dist/main.js`. **Render's filesystem is ephemeral** — any files saved to local disk (including multer uploads) are lost on every deploy or restart, which is why R2 integration is a production requirement.

**Status:** Plans L, N-1, N-2, N-3 complete. Frontend fully cleaned. Ready for R2 backend integration and deployment.
