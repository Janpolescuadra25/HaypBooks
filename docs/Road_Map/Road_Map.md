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
- [x] Audit endpoints for Chart of Accounts and Journal Entries
- [x] Global audit controller: `GET /api/audit/audit-logs`
- [x] Source document linking for traceability

### File Storage
- [x] Cloudflare R2 integration — `R2Service` and `R2Module` with upload, presigned URL, delete
- [x] Attachments upload with `memoryStorage()` + R2 (25MB limit)
- [x] Receipt upload endpoint: `POST /companies/:companyId/ap/receipts/upload`
- [x] Presigned URL generation: `GET /api/attachments/:id/url`

### Authentication & Onboarding
- [x] Email verification flow
- [x] Onboarding with company creation
- [x] JWT-based authentication (CSRF-immune)
- [x] Cross-subdomain CSRF protection for cookie-based requests

---

## Immediate Priorities (Next 2 Weeks)

### Priority 1: R2 VPS Deployment & Full E2E Testing
**Status:** Code complete, pending VPS deployment

- [ ] VPS: `npm install`, add R2 credentials to `.env`, `pm2 restart all`
- [ ] Test file upload via attachments endpoint — verify file appears in Cloudflare R2 dashboard
- [ ] Test presigned URL generation — verify file is accessible via returned URL
- [ ] Test receipt upload endpoint
- [ ] Full E2E test of core flows:
  - [ ] User registration → email verification → onboarding → workspace
  - [ ] Create journal entry → post → view in General Ledger → verify in Trial Balance
  - [ ] Upload attachment → verify in R2 → download via presigned URL
  - [ ] Bank reconciliation flow (create → match → complete)
  - [ ] Generate P&L, Balance Sheet, Cash Flow statements

**Expected output:** R2 fully operational in production, all core accounting flows validated end-to-end.

---

## Next Sprint (Weeks 3-4)

### Priority 2: Extend Audit Logging to All Entities
**Status:** Core accounting (COA, Journal Entries) covered; needs expansion

- [ ] Add audit logging to banking transactions (deposits, withdrawals, transfers)
- [ ] Add audit logging to invoices, bills, and payments
- [ ] Add audit logging to contacts (customers, vendors)
- [ ] Add audit logging to inventory items and fixed assets
- [ ] Create unified audit log UI page for accountants to review all entity changes
- [ ] Add audit log export to CSV for compliance evidence collection

**Expected output:** Every financial entity change is tracked at field level with before/after values. Accountants can review a complete, filterable audit trail.

### Priority 3: Practice Hub MVP
**Status:** Route structure exists, needs full implementation

- [ ] Build client management dashboard for accountants
- [ ] Implement multi-client bookkeeping workspace switching
- [ ] Add client onboarding workflow (collect financial data, import existing records)
- [ ] Add bulk operation tools for accounting firms (bulk invoice generation, bulk journal entries)
- [ ] Create client-specific financial overview (combined P&L across entities)

**Expected output:** Accounting firms can manage multiple client books from a single dashboard with quick-switch between entities.

---

## Future Plans

### Plan A: Self-Hosted PostgreSQL Migration
- Migrate from Supabase hosted PostgreSQL to self-hosted PostgreSQL on the VPS or a separate DB server
- Eliminates Supabase dependency, reduces costs, gives full control over backups and scaling
- **Blocked by:** Completion of R2 deployment and E2E testing

### Plan B: Multi-Currency Support
- Add currency fields to company settings, invoices, bills
- Implement exchange rate management (manual and auto-fetch)
- Convert financial statements to support multi-currency display
- **Blocked by:** Priority 2 (audit logging) completion

### Plan C: Budgeting Module
- Create budget templates by account and period
- Budget vs Actual comparison in financial statements
- Budget variance alerts and reporting
- **Blocked by:** Financial statement production validation

### Plan D: Approval Workflows
- Implement role-based access control (RBAC) for accounting functions
- Create approval chains for journal entries above a threshold amount
- Add manager approval for bank reconciliation completion
- **Blocked by:** Priority 2 (audit logging) completion

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
- [ ] Frontend receipt upload endpoint was calling a non-existent backend route (now fixed with R2 integration)
- [ ] 6 Prisma models have `fileUrl` fields still referencing local paths — need migration to R2 keys for old data
- [ ] No automated test suite exists — all testing is currently manual
