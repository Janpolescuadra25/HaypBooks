# HaypBooks — Development Roadmap

> Last updated: August 16, 2026

## Completed Projects
- ✅ **VPS Auto-Deploy Pipeline** — GitHub Actions → SSH → deploy.sh → PM2 restart. Fully operational. Every push to main auto-deploys to production.
- ✅ **Logo Replacement** — All placeholder logos (LandingHeader, AuthLayout, CinematicIntro, landing.html) replaced with HB_Logo.png. Favicon and metadata configured.
- ✅ **Repo Cleanup** — Removed stray root files, malformed filenames, and all "open source" references. HaypBooks is proprietary.
- ✅ **Build Error Fixes** — Resolved TypeScript/Prisma build errors in owner.service.ts.
- ✅ **Multi-Currency Support (Plan B)** — Full end-to-end multi-currency accounting: Currency/ExchangeRate models with 15 seeded currencies, ExchangeRateService with enforceCurrency() helper and live API rate fetching, currency enforcement in AR/Banking transaction services, shared formatCurrency() utility, company base currency selector, currency dropdowns with exchange rate preview on invoice/bill/payment forms, multi-currency financial reporting with display currency selector on P&L/Balance Sheet/Cash Flow/Trial Balance.

---

## Future Plans

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

### Plan F: Zypra AI Assistant
- Goal: Integrate a branded AI assistant ("Zypra") powered by Gemini API that answers questions about the user's own HaypBooks financial data
- Expected output: A floating chat widget inside the HaypBooks app that can answer accounting queries using real company data (invoices, bills, payments, balances, reports)
- Key constraints:
  - Zypra must ONLY answer questions related to HaypBooks data and accounting — all off-topic questions must be politely declined
  - Responses must be based on the user's actual company data, not generic advice
  - The AI must understand multi-currency contexts (leveraging Plan B work)
- Implementation phases:
  1. Backend: NestJS Gemini API service with system prompt guard, data context layer that fetches company financial data and injects it into prompts
  2. Frontend: Floating chat widget component, message history, typing indicators
  3. Quick Actions: Pre-built queries like "Show overdue bills", "Summarize this month's revenue", "Create invoice for [client]"
- **Blocked by:** Plan B Phase 4 (multi-currency reporting must be complete first)

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
