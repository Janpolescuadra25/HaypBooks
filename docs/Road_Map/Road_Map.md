# HaypBooks — Development Roadmap

> Last updated: August 16, 2026

## Completed Projects
- ✅ **VPS Auto-Deploy Pipeline** — GitHub Actions → SSH → deploy.sh → PM2 restart. Fully operational. Every push to main auto-deploys to production.
- ✅ **Logo Replacement** — All placeholder logos (LandingHeader, AuthLayout, CinematicIntro, landing.html) replaced with HB_Logo.png. Favicon and metadata configured.
- ✅ **Repo Cleanup** — Removed stray root files, malformed filenames, and all "open source" references. HaypBooks is proprietary.
- ✅ **Build Error Fixes** — Resolved TypeScript/Prisma build errors in owner.service.ts.
- ✅ **Multi-Currency Support (Plan B)** — Full end-to-end multi-currency accounting: Currency/ExchangeRate models with 15 seeded currencies, ExchangeRateService with enforceCurrency() helper and live API rate fetching, currency enforcement in AR/Banking transaction services, shared formatCurrency() utility, company base currency selector, currency dropdowns with exchange rate preview on invoice/bill/payment forms, multi-currency financial reporting with display currency selector on P&L/Balance Sheet/Cash Flow/Trial Balance.
- ✅ **Zypra AI Assistant (Plan F, Phase 1)** — Floating chat widget with Gemini-powered accounting Q&A, lazy initialization, quick actions, system prompt guardrails (August 2026).

---

## Future Plans

| Plan | Name | Status | Blocked By |
|------|------|--------|------------|
| A | Self-Hosted PostgreSQL Migration | Not Started | E2E testing completion |
| C | Budgeting Module | Not Started | Financial statement production validation |
| D | Approval Workflows | Not Started | - |
| E | Fixed Asset Management | Not Started | Core accounting E2E validation |
| F-2 | Zypra AI Phase 2 (Persistent History, Document Q&A, Advanced Insights) | Not Started | - |

### Plan A: Self-Hosted PostgreSQL Migration
- Goal: Migrate from Supabase hosted PostgreSQL to a self-hosted PostgreSQL instance on the VPS or a dedicated database server.
- Expected output: production-grade Postgres deployment, reliable backups, and a secure connection configuration for HaypBooks.
- Eliminates Supabase dependency, reduces costs, and gives full control over backups and scaling.
- **Blocked by:** E2E testing completion

### Plan C: Budgeting Module
- Goal: Deliver budgeting capability with variance tracking and reporting.
- Expected output: budget templates, budget vs actual comparison, and budget variance alerts.
- Create budget templates by account and period.
- Budget vs Actual comparison in financial statements.
- Budget variance alerts and reporting.
- **Blocked by:** Financial statement production validation

### Plan D: Approval Workflows
- Goal: Provide controlled approval flows for high-risk accounting actions.
- Expected output: RBAC-enabled approvals for journal entries and reconciliation signoff.
- Implement role-based access control (RBAC) for accounting functions.
- Create approval chains for journal entries above a threshold amount.
- Add manager approval for bank reconciliation completion.

### Plan E: Fixed Asset Management
- Goal: Add fixed asset tracking, depreciation, and disposal workflows.
- Expected output: asset register, scheduled depreciation journals, and disposal/revaluation support.
- Asset register with depreciation schedules (straight-line, declining balance).
- Automatic depreciation journal entries.
- Asset disposal and revaluation workflows.
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
- [ ] No automated test suite exists — all testing is currently manual
