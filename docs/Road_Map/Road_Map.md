# HaypBooks — Development Roadmap

> Last updated: August 2026

---

## Production-Validated Features (Implemented)

✅ Core Accounting Module (4 todos) · ✅ Financial Statements (4 todos) · ✅ Bank Reconciliation (3 todos) · ✅ Audit Logging (10 todos) · ✅ File Storage (7 todos) · ✅ Landing Page & Pricing (5 todos) · ✅ Authentication & Onboarding (4 todos) · ✅ Plan F: Owner Dashboard — Platform Monitoring & Usage Limits (13 todos) · ✅ Practice Hub MVP — Client management platform for accounting firms (5 todos)

---

## Next Sprint

#### Infrastructure & DevOps
- [x] GitHub Actions auto-deploy to Hetzner CX33 VPS — SSH-based workflow triggers on push to `main`, deploy.sh handles pull + build + migrate + pm2 restart
- [x] Fix auto-deploy path mismatch — `deploy.sh`, `ecosystem.config.js`, and `deploy.yml` use `/root/Haypbooks` but VPS actual path is `/root/HaypBooks/Haypbooks/`
- [x] Add 2 GB swap to VPS — backend uses ~5.4 GB RAM with 0B swap, causing OOM kills (173+ restarts)
- [x] Fix Nginx config to pass correct `Host`, `X-Forwarded-Host`, and `X-Forwarded-Proto` headers

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

### Plan C: Budgeting Module
- Create budget templates by account and period
- Budget vs Actual comparison in financial statements
- Budget variance alerts and reporting
- **Blocked by:** Financial statement production validation

### Plan D: Approval Workflows
- Implement role-based access control (RBAC) for accounting functions
- Create approval chains for journal entries above a threshold amount
- Add manager approval for bank reconciliation completion

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
- [ ] No automated test suite exists — all testing is currently manual
