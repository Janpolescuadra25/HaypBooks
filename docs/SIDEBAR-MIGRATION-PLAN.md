# Sidebar Migration Plan

Target: restructure `ownerNavConfig.ts` OPERATIONS section from 3-level deep tree to 6 simple top-level links.

---

## Current Structure (what we're changing)

Inside the `OPERATIONS` section, `groups` currently looks like:

```
OPERATIONS
├─ group: "Cash & Banking"
│   ├─ item: "Transactions"  (with children)
│   │   ├─ leaf: "Bank Transactions"  → /banking-cash/transactions/bank-transactions
│   │   └─ leaf: "Deposits"           → /banking-cash/transactions/deposits
│   ├─ item: "Reconciliation"  (with children)
│   │   ├─ leaf: "Reconciliation Hub" → ...
│   │   └─ ...
│   └─ ... (5 subsections total, 16 leaf items)
│
├─ group: "Sales (Order-to-Cash)"
│   └─ ... (5 subsections, 20 leaf items)
│
├─ group: "Expenses (Procure-to-Pay)"
│   └─ ... (3 subsections, 16 leaf items)
│
├─ group: "Inventory"
│   └─ ... (5 subsections, 20 leaf items)
│
├─ group: "Projects"
│   └─ ... (4 subsections, 15 leaf items)
│
└─ group: "Time"
    └─ ... (2 subsections, 5 leaf items)
```

**Total items inside OPERATIONS groups: 117** (25 subsection nodes + 92 leaf links)

---

## New Structure (target)

```
OPERATIONS
├─ link: "Cash & Banking"    → /banking-cash/transactions/bank-transactions
├─ link: "Sales"             → /sales/customers/customers
├─ link: "Expenses"          → /expenses/vendors/vendors
├─ link: "Inventory"         → /inventory/setup/inventory-items
├─ link: "Projects"          → /projects/project-setup/projects
└─ link: "Time"              → /time/entry/time-entries
```

**Items inside OPERATIONS groups after migration: 6**

Sidebar depth reduction: **117 → 6 items (95% reduction)** within OPERATIONS.  
The tabs (both subsection-level and leaf-level) are removed from the sidebar entirely — they live inside the page as a 2-level tab bar.

---

## Exact Changes to `ownerNavConfig.ts`

### Find this block (lines ~75–310, the entire OPERATIONS groups array):

```typescript
{
  title: 'OPERATIONS',
  icon: BarChart3,
  groups: [
    {
      title: 'Cash & Banking',
      items: [
        {
          title: 'Transactions',
          items: [
            { title: 'Bank Transactions', path: '/banking-cash/transactions/bank-transactions' },
            { title: 'Deposits', path: '/banking-cash/transactions/deposits' },
          ],
        },
        // ... all 5 subsections and 16 leaf items for Cash & Banking ...
      ],
    },
    {
      title: 'Sales (Order-to-Cash)',
      items: [ /* 5 subsections, 20 leaves */ ],
    },
    {
      title: 'Expenses (Procure-to-Pay)',
      items: [ /* 3 subsections, 16 leaves */ ],
    },
    {
      title: 'Inventory',
      items: [ /* 5 subsections, 20 leaves */ ],
    },
    {
      title: 'Projects',
      items: [ /* 4 subsections, 15 leaves */ ],
    },
    {
      title: 'Time',
      items: [ /* 2 subsections, 5 leaves */ ],
    },
  ],
},
```

### Replace with:

```typescript
{
  title: 'OPERATIONS',
  icon: BarChart3,
  groups: [
    {
      title: 'Operations',
      items: [
        { title: 'Cash & Banking',            path: '/banking-cash/transactions/bank-transactions' },
        { title: 'Sales (Order-to-Cash)',      path: '/sales/customers/customers' },
        { title: 'Expenses (Procure-to-Pay)',  path: '/expenses/vendors/vendors' },
        { title: 'Inventory',                  path: '/inventory/setup/inventory-items' },
        { title: 'Projects',                   path: '/projects/project-setup/projects' },
        { title: 'Time',                       path: '/time/entry/time-entries' },
      ],
    },
  ],
},
```

---

## Items That Will Be Removed from Sidebar

All items listed below are **removed from the sidebar**. Their content is now accessible through the in-page tab bars.

### CASH & BANKING (removed: 21 items)
- Subsections: Transactions, Reconciliation, Accounts, Management, Cash Management
- Leaves: Bank Transactions, Deposits, Reconciliation Hub, Reconcile, History, Statement Archive, Bank Accounts, Credit Cards, Petty Cash, Clearing Accounts, Transaction Rules, Recurring Transactions, App Transactions, Cash Position, Cash Flow Projection, Short-Term Forecast

### SALES (removed: 25 items)
- Subsections: Customers, Sales, Billing, Collections, Revenue
- Leaves: Customers, Customer Groups, Price Lists, Customer Portal, Products & Services, Quotes, Sales Orders, Invoices, Recurring Invoices, Subscriptions, Payment Links, Customer Payments, A/R Aging, Collections Center, Dunning, Write-Offs, Refunds, Credit Notes, Revenue Recognition, Deferred Revenue

### EXPENSES (removed: 19 items)
- Subsections: Purchasing, Bills & Payments, Expense Capture
- Leaves: Vendors, Purchase Requests, Purchase Orders, RFQ, Approvals, Bills, Recurring Bills, Bill Payments, Payment Runs, Vendor Credits, A/P Aging, Expenses, Receipts, Mileage, Per Diem, Reimbursements

### INVENTORY (removed: 25 items)
- Subsections: Items, Operations, Warehousing, Control, Valuation
- Leaves: Inventory Items, Categories, Bundles, Units of Measure, Item Receipts, Stock Movements, Adjustments, Transfers, Warehouses, Bin Locations, Zones, Cycle Counts, Physical Counts, Lot/Serial Tracking, Reorder Points, Safety Stock, Inventory Valuation, Landed Costs, Cost Adjustments, Write-Downs

### PROJECTS (removed: 19 items)
- Subsections: Setup, Execution, Billing, Financials
- Leaves: Projects, Project Templates, Milestones, Contracts, Project Tasks, Schedule, Resource Planning, Time & Expenses, Project Billing, Progress Billing, Milestone Billing, Change Orders, WIP, Project Profitability, Budget vs Actual

### TIME (removed: 7 items)
- Subsections: Entry, Review
- Leaves: Time Entries, Timesheets, Timer, Billable Time Review, Time Approvals

**Total removed: 116 entries**

---

## Breaking Changes & Impact Analysis

### Components that import `navigationData` / `ownerNavConfig`

| File | Import | Impact | Action |
|------|--------|--------|--------|
| `OwnerSidebar.tsx` | `navigationData` | **HIGH** — renders entire nav | Re-test sidebar after config change |
| `SetupCenter.tsx` | None (uses hardcoded paths) | NONE | Already fixed (commit 8f6aa720) |
| `operations-navigation.ts` | None (independent config) | NONE | Source of truth for tab UI |

### Hardcoded path references
Run this search before migration to verify no remaining stale references:
```
grep -r "/banking-cash/management" src/
grep -r "/sales/sales-operations" src/
grep -r "/expenses/purchasing/purchase-requests" src/
```

### URL backward compatibility
Existing `(owner)` pages still live at their old URLs (e.g., `/banking-cash/transactions/bank-transactions`).  
After the sidebar migration, old bookmark URLs will still work — only the sidebar won't show deep links to them. This is acceptable because the tab UI provides the same navigation.

---

## Migration Checklist

- [ ] Back up `ownerNavConfig.ts` before editing
- [ ] Apply the OPERATIONS groups replacement shown above
- [ ] Verify sidebar renders without TypeScript errors (`npx tsc --noEmit`)
- [ ] Smoke-test: sidebar shows 6 OPERATIONS links
- [ ] Smoke-test: clicking each link navigates to the default tab page
- [ ] Verify `OwnerSidebar.tsx` active-state highlighting still works (uses `usePathname` comparison)
- [ ] Commit: `refactor(nav): simplify OPERATIONS sidebar to 6 top-level section links`
