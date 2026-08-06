# HaypBooks Frontend Roadmap
**Last Updated:** August 7, 2026  
**Branch:** `main` (40 commits ahead of origin)  
**Total Built Pages:** ~270  
**ComingSoon Stubs Remaining:** 77  
**Service Files:** 17  

---

## Completed Modules (10)

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

## Future Modules (Post-Plan C)

| Module | Stubs | Blocker | Est. Batches |
|---|---|---|---|
| Home Dashboard | 5 | No chart library installed; 5 stubs need visualizations. Main dashboard already built (OwnerDashboard.tsx). | 3-5 |
| Settings | 8 | No form gold standard yet | 2-4 |
| Reporting | 10 | Chart library, export functionality | 3-5 |
| Tasks & Approvals | 9 | Pre-flight audit; can reuse 14A-2 action pattern | 2-4 |
| Compliance | 4 | Pre-flight audit | 2-3 |
| Automation | 5 | Pre-flight audit | 2-3 |
| Integrations | 8 | Pre-flight audit | 3-4 |
| Banking (remaining) | 1 | Pre-flight audit | 1-2 |
| Accountant Workspace | 1 | Pre-flight audit | 1 |

---

## Known Tech Debt

1. ~~**Header pattern drift**~~ — ✅ Resolved. 31 pages normalized via Plan C (C-1 through C-4)
2. ~~**Table styling drift**~~ — ✅ Resolved. S1-S4 structural fixes applied across all Plan C batches
3. **Missing shared components** — LoadingSpinner, FilterPills not yet extracted
4. **DashboardHeader.tsx + GlassCard.tsx** — 0-byte files, NOT imported anywhere. Main dashboard already built via OwnerDashboard.tsx (18KB, fully functional). Actual blockers: 5 ComingSoon stubs need chart library + domain visualizations
5. **108 HaypDataTable pages** (Expenses, Sales) — Different pattern, intentionally not unified
6. **Employees page** — Uses `gray-*`, raw `fetch()`, `Loader2` — needs full rebuild (C-5 deferred)
7. **3 custom detail pages** — chart-of-accounts, journal-entries/[id], budgets/[budgetId] — too custom for Plan C
8. **Backend schema drift** — TimeEntry, TimerSession, ProjectMilestone field name mismatches

---

## Commit History (Plan C)

| Commit | Batch | Description |
|---|---|---|
| `df2623d4` | C-1 | Normalize 10 Inventory pages (11 systematic fixes) |
| `78f70968` | C-1-fix | Apply structural + date + search fixes to Inventory |
| `65119adc` | C-1-fix | Complete structural normalization for Inventory |
| `cc2365ac` | C-2 | Normalize 10 Tax pages (11 systematic fixes) |
| `351908ff` | C-2-fix | Structural fixes for 12 Tax module tables (S1/S2/S3/Fix6/Fix7/outer-div) |
| `89127632` | C-3 | Normalize 8 Accounting + Budgeting pages to Pattern A (15-fix recipe) |
| `389078fc` | C-4 | Normalize 3 special case inventory files (lot-serial-tracking, inventory-valuation, bin-locations) |
