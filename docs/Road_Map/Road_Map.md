# HaypBooks Frontend Roadmap
**Last Updated:** August 8, 2026  
**Branch:** `main` (61 commits ahead of origin)  
**Total Built Pages:** ~284  
**ComingSoon Stubs Remaining:** 48  
**Service Files:** 22  

---

## Completed Modules (16)

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

---

## Plan C: Cross-Module QA (COMPLETE ✅)

**Purpose:** Normalized 31 older pages across Inventory, Tax, and Accounting/Budgeting to match Pattern A (payroll gold standard).

**Gold standard file:** `src/app/(owner)/payroll-workforce/payroll-taxes/government-contributions/page.tsx`

**Batches completed:**
- C-1 + C-1-fix: 10 Inventory pages (11 class swaps + S1-S4 structural + date + search)
- C-2 + C-2-fix: 10 Tax pages (same recipe)
- C-3: 8 Accounting + Budgeting pages (full 15-fix recipe)
- C-4: 3 special case inventory files (lot-serial-tracking, inventory-valuation, bin-locations)
- C-5: Employees page — ⏸️ Deferred (needs full rebuild, different complexity)
- 2 banking files (transactions, register) — permanently deferred (specialized workflow UIs)

> The 15-fix recipe and detailed sub-batch specs are preserved in git commit history.

---

## Plan D: Dead Code Cleanup (COMPLETE ✅)

- Deleted 7 dead components (AccountSplitModal, BulkActionBar, DataPage, EmptyStateEnhanced, DashboardHeader, GlassCard, EdgeInset) — 1,225 lines removed
- Deleted 3 orphaned test files
- Deleted stale jest.search.config.js
- Fixed ComingSoonPage.tsx: gray-* → slate-* (4 classes, fixes 77 stub pages)
- HaypDateRangePicker.tsx kept (active dependency of HaypDataTable)

---

## Plan E: Tasks & Approvals (COMPLETE ✅)

- **E-1** ✅ — Service file (`tasks-approvals.service.ts`, 9 methods), domain types (`ApprovalRequest`, `Task`), my-approvals Pattern A page (8-col table, filter pills, approve/reject, RejectionReasonModal, escalation indicator)
- **E-2** ✅ — Build 4 my-work list pages (my-tasks, my-exceptions, overdue-items, calendar)
- **E-3** ✅ — Build 5 management list pages (approval-queue, approval-history, delegated-tasks, team-tasks, task-templates)

---

---

## Plan F: Settings (COMPLETE ✅)
- F-1: Form gold standard — company-details, fiscal-year-setup (2 pages) ✅
- F-2: Table+modal pattern — numbering-sequences, custom-fields, data-backup (3 pages) ✅
- F-3: User security — user-management, roles-permissions, two-factor-auth (3 pages) ✅

---

## Plan G: Compliance (COMPLETE ✅)
- G-1: Controls — internal-controls, control-testing, policy-management (3 pages) ✅
- G-2: Monitoring — issue-tracking, fraud-detection-rules (2 pages) ✅
- Pre-existing: audit-log-analysis (Ledger Health Monitor) ✅

---

## Plan H: Banking + Accountant Workspace (COMPLETE ✅)
- Banking: Statement Archive (1 page) ✅
- Accountant Workspace: Client Requests (1 page) ✅

---

## Plan I: Automation (COMPLETE ✅)
- I-1: Workflow Builder, Smart Rules, AI Bookkeeping (3 pages) ✅
- I-2: Smart Matching, Automation Logs, Error Queue (3 pages) ✅

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

## Future Modules (Post-Plan I)

| Module | Stubs | Blocker | Est. Batches |
|---|---|---|---|
| Home Dashboard | 5 | No chart library installed; 5 stubs need visualizations. Main dashboard already built (OwnerDashboard.tsx). | 3-5 |
| Reporting | 10 | Chart library, export functionality | 3-5 |
| Integrations | 8 | Pre-flight audit | 3-4 |

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
