# HaypBooks — Development Roadmap

> Last updated: August 2026

---

## Production-Validated Features (Implemented)

✅ Core Accounting Module (4 todos) · ✅ Financial Statements (4 todos) · ✅ Bank Reconciliation (3 todos) · ✅ Audit Logging (10 todos) · ✅ File Storage (7 todos) · ✅ Landing Page & Pricing (5 todos) · ✅ Authentication & Onboarding (4 todos) · ✅ Plan F: Owner Dashboard — Platform Monitoring & Usage Limits (13 todos)

---

## Next Sprint

> Two parallel active tracks are in progress: Practice Hub MVP and Owner Dashboard implementation.

### Practice Hub MVP
**Status**: ✅ Active Implementation — 4 of 5 todos complete

Build the client management platform for accounting firms — enabling multi-client bookkeeping from a single dashboard.

#### Progress Tracker
| # | Todo | Status |
|---|------|--------|
| 1 | Practice Hub infrastructure (sidebar, layout, nav config, page template, route group) | ✅ Complete |
| 2 | Practice dashboard page (stat cards, activity feed, deadlines, client preview) | ✅ Complete |
| 3 | Client list page with search and pagination | ✅ Complete |
| 4 | Multi-client workspace switching | ✅ Complete |
| 5 | Client onboarding workflow | ⬜ Pending |

**Expected output:** Accounting firms can manage multiple client books from a single dashboard with quick-switch between entities.

#### Infrastructure & DevOps
- [ ] GitHub Actions auto-deploy to Hetzner CX33 VPS — SSH-based workflow that triggers on push to `main`, pulls code on the server, rebuilds the Next.js frontend (`npm run build`), and restarts the NestJS backend (pm2). Setup: generate SSH key pair, add VPS public key to GitHub Actions secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY), create `.github/workflows/deploy.yml`, and add a `deploy.sh` script on the VPS.

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
