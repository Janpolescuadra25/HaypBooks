# Implementation Roadmap — Tab-Based Operations Navigation

Total scope: 92 tabs across 6 sections.  
Starting point: 68 tabs with exact routes, 11 via catch-all, 9 path mismatches, 4 missing.

---

## Phase 1 Progress — ✅ COMPLETE

**Date completed:** April 9, 2026  
**Commit:** `feat: implement tab-based navigation for Cash & Banking section (Phase 1)`

### Components Built

| Component | File | Status |
|-----------|------|--------|
| `SectionTabBar` | `components/layout/tabs/SectionTabBar.tsx` | ✅ Done |
| `ContentTabBar` | `components/layout/tabs/ContentTabBar.tsx` | ✅ Done |
| `SectionBreadcrumb` | `components/layout/tabs/SectionBreadcrumb.tsx` | ✅ Done |
| `TabbedSectionLayout` | `components/layout/tabs/TabbedSectionLayout.tsx` | ✅ Done |
| `TabPlaceholder` | `components/layout/tabs/TabPlaceholder.tsx` | ✅ Done |

All components in `src/components/layout/tabs/`. All read from `src/config/operations-navigation.ts`.

### Sidebar Restructured

`ownerNavConfig.ts` OPERATIONS section: **117 nested items → 6 flat links**.  
Old groups config preserved as comments for reference.

### Cash & Banking — 17 Tab Pages Created

URL base: `/operations/cash-banking/<subsection>/<tab>`  
Layout: `app/(owner)/operations/cash-banking/layout.tsx` wraps `TabbedSectionLayout sectionKey="cash-banking"`

| Subsection | Tab | Status |
|------------|-----|--------|
| Transactions | Bank Transactions | ✅ Real — `BankTransactionsPage` component |
| Transactions | Deposits | ✅ Real — `DepositsCrudPage` component |
| Reconciliation | Reconciliation Hub | ✅ Placeholder |
| Reconciliation | Reconcile | ✅ Real — `BankReconciliationPage` component |
| Reconciliation | History | ✅ Placeholder |
| Reconciliation | Statement Archive | ✅ Placeholder |
| Accounts | Bank Accounts | ✅ Real — `BankAccountsCrudPage` component |
| Accounts | Credit Cards | ✅ Placeholder |
| Accounts | Petty Cash | ✅ Placeholder |
| Accounts | Clearing Accounts | ✅ Placeholder |
| Management | Transaction Rules | ✅ Placeholder |
| Management | Recurring Transactions | ✅ Placeholder |
| Management | App Transactions | ✅ Placeholder |
| Cash Management | Cash Position | ✅ Placeholder |
| Cash Management | Cash Flow Projection | ✅ Placeholder |
| Cash Management | Short-Term Forecast | ✅ Placeholder |

### Testing Results

- TypeScript (new files only): **0 errors**
- Added `@/config/*` path alias to `tsconfig.json`
- Added `.no-scrollbar` utility to `globals.css`
- Mobile horizontal scroll: built into all tab bars via `overflow-x-auto no-scrollbar`
- Keyboard navigation: ArrowLeft/ArrowRight/Home/End on both tab bars
- Accessibility: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-current="page"`
- Framer Motion: `layoutId="section-tab-underline"` animated underline, AnimatePresence on ContentTabBar

### Architecture Notes

- URL pattern: `/operations/cash-banking/<subsectionId>/<tabId>` (new, clean)
- Subsection/tab IDs parsed directly from URL segments — no need to pass as props
- Layout.tsx at section level wraps ALL child routes automatically
- Old `/banking-cash/...` routes still exist (backward compatible) — will redirect later

---

## Phase 2 Progress — ✅ COMPLETE

**Commit:** `feat: implement tab-based navigation for Sales section (Phase 2)`

### Sales (Order-to-Cash) — 20 Tab Pages Created

URL base: `/operations/sales/<subsection>/<tab>`  
Layout: `app/(owner)/operations/sales/layout.tsx` wraps `TabbedSectionLayout sectionKey="sales"`

| Subsection | Tab | Status |
|------------|-----|--------|
| Customers | Customers | ✅ Real — `CustomersPage` |
| Customers | Customer Groups | ✅ Real — `CustomerGroupsPage` |
| Customers | Price Lists | ✅ Real — `PriceListsPage` |
| Customers | Customer Portal | ✅ Real — `CustomerPortalPage` |
| Sales | Products & Services | ✅ Real — `ProductsServicesPage` |
| Sales | Quotes | ✅ Real — `QuotesEstimatesPage` |
| Sales | Sales Orders | ✅ Real — `SalesOrdersPage` |
| Billing | Invoices | ✅ Real — `InvoicesPage` |
| Billing | Recurring Invoices | ✅ Real — `RecurringInvoicesPage` |
| Billing | Subscriptions | ✅ Real — `SubscriptionsPage` |
| Billing | Payment Links | ✅ Real — `PaymentLinksPage` |
| Collections | Customer Payments | ✅ Real — `CustomerPaymentsPage` |
| Collections | A/R Aging | ✅ Real — `ArAgingPage` |
| Collections | Collections Center | ✅ Real — `CollectionsCenterPage` |
| Collections | Dunning | ✅ Real — `DunningManagementPage` |
| Collections | Write-Offs | ✅ Real — `WriteOffsPage` |
| Collections | Refunds | ✅ Real — `RefundsPage` |
| Revenue | Credit Notes | ✅ Real — `CreditNotesPage` |
| Revenue | Revenue Recognition | ✅ Real — `RevenueRecognitionPage` |
| Revenue | Deferred Revenue | ✅ Real — `DeferredRevenuePage` |

All 20 tabs wired to real components — 0 placeholders needed (all components existed in `src/components/sales/`).

### Phase 2 Config Changes

- `operations-navigation.ts`: All 20 sales paths updated from `/sales/...` → `/operations/sales/...`
- `ownerNavConfig.ts`: Sales sidebar link updated to `/operations/sales/customers/customers`

---

## Phase 1 — Core Infrastructure (Original Plan)

**Goal:** Build the tab components and wire up navigation so every section is reachable, even if most tabs show a placeholder.

### 1.1 New UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `SectionTabBar` | `components/ui/SectionTabBar.tsx` | Primary tab bar (subsections: Transactions, Reconciliation…) |
| `ContentTabBar` | `components/ui/ContentTabBar.tsx` | Secondary tab bar (leaf tabs: Bank Transactions, Deposits…) |
| `SectionBreadcrumb` | `components/ui/SectionBreadcrumb.tsx` | Breadcrumb: Cash & Banking › Transactions › Bank Transactions |
| `TabbedSectionLayout` | `components/layout/TabbedSectionLayout.tsx` | Wrapper: breadcrumb + SectionTabBar + ContentTabBar + content area |
| `TabPlaceholder` | `components/ui/TabPlaceholder.tsx` | "Coming Soon" content stub for unbuilt tabs |

All components read from `src/config/operations-navigation.ts` — no hardcoded strings.

### 1.2 Simplify Sidebar

Replace the 116-item OPERATIONS tree with 6 flat links (see `SIDEBAR-MIGRATION-PLAN.md`).  
Commit: `refactor(nav): simplify OPERATIONS sidebar to 6 top-level section links`

### 1.3 Section Landing Pages

Create or update the landing page for each of the 6 sections so they render `TabbedSectionLayout` with the default subsection and tab active.

| Section | Landing route | Default tab |
|---------|--------------|-------------|
| Cash & Banking | `/banking-cash/transactions/bank-transactions` | Already exists |
| Sales | `/sales/customers/customers` | Already exists |
| Expenses | `/expenses/vendors/vendors` | Already exists |
| Inventory | `/inventory/setup/inventory-items` | Already exists |
| Projects | `/projects/project-setup/projects` | Already exists |
| Time | `/time/entry/time-entries` | Already exists |

### 1.4 Fix Path Mismatches (9 tabs)

Add thin `(owner)` route files at the correct config URLs that re-use the existing component.  
These are ~5-line files each — no new logic needed.

```
(owner)/banking-cash/management/transaction-rules/page.tsx     → re-export from transactions/
(owner)/banking-cash/management/recurring-transactions/page.tsx → re-export
(owner)/sales/collections/dunning/page.tsx                      → re-export from dunning-management
(owner)/sales/revenue/credit-notes/page.tsx                     → re-export from billing/credit-notes
(owner)/expenses/vendors/purchase-requests/page.tsx             → re-export from purchasing/
(owner)/expenses/vendors/approvals/page.tsx                     → re-export from purchasing/approval-workflows
(owner)/inventory/setup/bundles/page.tsx                        → re-export from setup/bundles-assemblies
(owner)/inventory/stock-operations/item-receipts/page.tsx       → re-export from receiving/item-receipts
(owner)/projects/project-setup/project-tasks/page.tsx           → re-export from planning/project-tasks
```

Commit: `fix(routes): add missing (owner) route aliases for 9 path-mismatched tabs`

### Phase 1 Deliverable
- All 6 sections navigable from sidebar
- Two-level tab bar visible on every section page
- Correct URL routing (no 404s and no "Coming Soon" from misrouted paths)
- 9 path mismatches resolved

---

## Phase 2 — Fill Missing Pages (4 tabs)

Only 4 tabs have no page content at all. Create them as real functional pages.

| Tab | Route | Component | Note |
|-----|-------|-----------|------|
| Deposits | `/banking-cash/transactions/deposits` | `DepositsCrudPage` | **Already exists** in `components/owner/DepositsCrudPage.tsx` — just wire the route |
| Reconciliation Hub | `/banking-cash/reconciliation/reconciliation-hub` | New `ReconciliationHubPage` | Dashboard showing reconciliation status across all accounts |
| Clearing Accounts | `/banking-cash/accounts/clearing-accounts` | New `ClearingAccountsPage` | Simple CRUD list similar to BankAccountsCrudPage |
| RFQ | `/expenses/vendors/rfq` | New `RFQPage` | Request for Quotation list + form |

**Deposits is effectively free** — the component already exists.

Commit: `feat(banking,expenses): add Deposits, Reconciliation Hub, Clearing Accounts, and RFQ pages`

---

## Phase 3 — Integrate TabbedSectionLayout Into Each Section

Wrap each section's existing pages inside `TabbedSectionLayout` so the tab bars render above the content.

### Approach
Each (owner) page becomes:
```tsx
// app/(owner)/banking-cash/transactions/bank-transactions/page.tsx
import { TabbedSectionLayout } from '@/components/layout/TabbedSectionLayout'
import BankTransactionsPage from '@/components/owner/BankTransactionsPage'

export default function Page() {
  return (
    <TabbedSectionLayout sectionId="cash-banking" subsectionId="transactions" tabId="bank-transactions">
      <BankTransactionsPage />
    </TabbedSectionLayout>
  )
}
```

`TabbedSectionLayout` uses `operations-navigation.ts` to build the breadcrumb and both tab bars automatically from the three IDs.

### Priority order within Phase 3

**Round A — High-traffic pages first (do in one sitting):**
Banking-Cash: Bank Transactions, Reconcile, Bank Accounts, Credit Cards  
Sales: Invoices, Customers, Customer Payments  
Expenses: Bills, Vendors, Expenses  

**Round B — Complete remaining exact-match pages:**
All remaining ✅ EXACT tabs across all 6 sections

**Round C — Catch-all pages:**
Move catch-all component renders into proper (owner) routes with TabbedSectionLayout  
Remove the now-redundant entries from `[[...slug]]` pages once (owner) routes exist

Commit per section: `feat(tab-ui): wrap [Section] pages in TabbedSectionLayout`

---

## Phase 4 — Polish

Once all tabs are wrapped:

- **Active state persistence:** URL is already the source of truth; no extra state needed
- **Keyboard nav:** Add `aria-` roles to tab bars for accessibility (WCAG AA)
- **Mobile responsive:** Tab bars scroll horizontally on small screens
- **Transition:** Add 150ms fade between tab content areas (Framer Motion)
- **Browser back/forward:** Already works via URL routing — verify with manual test

---

## Dependency Graph

```
Phase 1 ──►  Phase 3 (Round A)
   │                │
   ▼                ▼
Phase 2 ──►  Phase 3 (Round B + C)
                    │
                    ▼
               Phase 4
```

Phase 1 is the only hard blocker. Phases 2 and 3 can run in parallel once Phase 1 is done.

---

## Effort Estimate

| Work item | Effort |
|-----------|--------|
| Phase 1: 5 new UI components | ~4–6 hours |
| Phase 1: Sidebar simplification | ~1 hour |
| Phase 1: 9 route alias files | ~1 hour |
| Phase 2: Deposits (already has component) | ~30 min |
| Phase 2: 3 new pages (Reconciliation Hub, Clearing Accounts, RFQ) | ~3–4 hours |
| Phase 3: Wrap all 92 tabs in TabbedSectionLayout | ~6–8 hours |
| Phase 4: Polish (a11y, animations, mobile) | ~3–4 hours |
| **Total** | **~19–25 hours** |

Confident this is achievable in 1 focused week.

---

## Commit Sequence (recommended)

1. `feat(ui): add SectionTabBar, ContentTabBar, SectionBreadcrumb, TabbedSectionLayout, TabPlaceholder components`
2. `refactor(nav): simplify OPERATIONS sidebar to 6 top-level section links`
3. `fix(routes): add missing (owner) route aliases for 9 path-mismatched tabs`
4. `feat(banking): wire Deposits route to DepositsCrudPage`
5. `feat(banking,expenses): add Reconciliation Hub, Clearing Accounts, and RFQ pages`
6. `feat(tab-ui): wrap Cash & Banking pages in TabbedSectionLayout`
7. `feat(tab-ui): wrap Sales pages in TabbedSectionLayout`
8. `feat(tab-ui): wrap Expenses pages in TabbedSectionLayout`
9. `feat(tab-ui): wrap Inventory pages in TabbedSectionLayout`
10. `feat(tab-ui): wrap Projects and Time pages in TabbedSectionLayout`
11. `feat(tab-ui): migrate catch-all pages to (owner) routes, remove [[...slug]] fallbacks`
12. `feat(tab-ui): add keyboard nav, transitions, and mobile responsive tab bars`
