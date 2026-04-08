/**
 * Operations Navigation Configuration
 *
 * Defines the full tab-based hierarchy for the 6 Operations sections:
 *   Section  →  Subsection (primary tab)  →  Tab (leaf page)
 *
 * Paths are kept in sync with ownerNavConfig.ts and the Next.js (owner)
 * route structure so any component can use this as a single source of truth.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavTab {
  /** Unique slug within the subsection */
  id: string
  /** Display label shown on the secondary tab bar */
  label: string
  /** Next.js href used by <Link> */
  path: string
}

export interface NavSubsection {
  /** Unique slug within the section */
  id: string
  /** Display label shown on the primary tab bar */
  label: string
  /** Leaf-level tabs for the secondary tab bar */
  tabs: NavTab[]
}

export interface OperationsSection {
  /** Unique slug — also the URL segment (e.g. 'cash-banking') */
  id: string
  /** Full display label for the section header / breadcrumb */
  label: string
  /** Primary tabs (sub-sections) */
  subsections: NavSubsection[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const OPERATIONS_NAV: OperationsSection[] = [

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Cash & Banking
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'cash-banking',
    label: 'Cash & Banking',
    subsections: [
      {
        id: 'transactions',
        label: 'Transactions',
        tabs: [
          { id: 'bank-transactions',    label: 'Bank Transactions',    path: '/operations/cash-banking/transactions/bank-transactions' },
          { id: 'deposits',             label: 'Deposits',             path: '/operations/cash-banking/transactions/deposits' },
        ],
      },
      {
        id: 'reconciliation',
        label: 'Reconciliation',
        tabs: [
          { id: 'reconciliation-hub',   label: 'Reconciliation Hub',   path: '/operations/cash-banking/reconciliation/reconciliation-hub' },
          { id: 'reconcile',            label: 'Reconcile',            path: '/operations/cash-banking/reconciliation/reconcile' },
          { id: 'history',              label: 'History',              path: '/operations/cash-banking/reconciliation/history' },
          { id: 'statement-archive',    label: 'Statement Archive',    path: '/operations/cash-banking/reconciliation/statement-archive' },
        ],
      },
      {
        id: 'accounts',
        label: 'Accounts',
        tabs: [
          { id: 'bank-accounts',        label: 'Bank Accounts',        path: '/operations/cash-banking/accounts/bank-accounts' },
          { id: 'credit-cards',         label: 'Credit Cards',         path: '/operations/cash-banking/accounts/credit-cards' },
          { id: 'petty-cash',           label: 'Petty Cash',           path: '/operations/cash-banking/accounts/petty-cash' },
          { id: 'clearing-accounts',    label: 'Clearing Accounts',    path: '/operations/cash-banking/accounts/clearing-accounts' },
        ],
      },
      {
        id: 'management',
        label: 'Management',
        tabs: [
          { id: 'transaction-rules',    label: 'Transaction Rules',    path: '/operations/cash-banking/management/transaction-rules' },
          { id: 'recurring-transactions', label: 'Recurring Transactions', path: '/operations/cash-banking/management/recurring-transactions' },
          { id: 'app-transactions',     label: 'App Transactions',     path: '/operations/cash-banking/management/app-transactions' },
        ],
      },
      {
        id: 'cash-management',
        label: 'Cash Management',
        tabs: [
          { id: 'cash-position',        label: 'Cash Position',        path: '/operations/cash-banking/cash-management/cash-position' },
          { id: 'cash-flow-projection', label: 'Cash Flow Projection', path: '/operations/cash-banking/cash-management/cash-flow-projection' },
          { id: 'short-term-forecast',  label: 'Short-Term Forecast',  path: '/operations/cash-banking/cash-management/short-term-forecast' },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Sales (Order-to-Cash)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'sales',
    label: 'Sales (Order-to-Cash)',
    subsections: [
      {
        id: 'customers',
        label: 'Customers',
        tabs: [
          { id: 'customers',            label: 'Customers',            path: '/operations/sales/customers/customers' },
          { id: 'customer-groups',      label: 'Customer Groups',      path: '/operations/sales/customers/customer-groups' },
          { id: 'price-lists',          label: 'Price Lists',          path: '/operations/sales/customers/price-lists' },
          { id: 'customer-portal',      label: 'Customer Portal',      path: '/operations/sales/customers/customer-portal' },
        ],
      },
      {
        id: 'sales',
        label: 'Sales',
        tabs: [
          { id: 'products-services',    label: 'Products & Services',  path: '/operations/sales/sales/products-services' },
          { id: 'quotes',               label: 'Quotes',               path: '/operations/sales/sales/quotes' },
          { id: 'sales-orders',         label: 'Sales Orders',         path: '/operations/sales/sales/sales-orders' },
        ],
      },
      {
        id: 'billing',
        label: 'Billing',
        tabs: [
          { id: 'invoices',             label: 'Invoices',             path: '/operations/sales/billing/invoices' },
          { id: 'recurring-invoices',   label: 'Recurring Invoices',   path: '/operations/sales/billing/recurring-invoices' },
          { id: 'subscriptions',        label: 'Subscriptions',        path: '/operations/sales/billing/subscriptions' },
          { id: 'payment-links',        label: 'Payment Links',        path: '/operations/sales/billing/payment-links' },
        ],
      },
      {
        id: 'collections',
        label: 'Collections',
        tabs: [
          { id: 'customer-payments',    label: 'Customer Payments',    path: '/operations/sales/collections/customer-payments' },
          { id: 'ar-aging',             label: 'A/R Aging',            path: '/operations/sales/collections/ar-aging' },
          { id: 'collections-center',   label: 'Collections Center',   path: '/operations/sales/collections/collections-center' },
          { id: 'dunning',              label: 'Dunning',              path: '/operations/sales/collections/dunning' },
          { id: 'write-offs',           label: 'Write-Offs',           path: '/operations/sales/collections/write-offs' },
          { id: 'refunds',              label: 'Refunds',              path: '/operations/sales/collections/refunds' },
        ],
      },
      {
        id: 'revenue',
        label: 'Revenue',
        tabs: [
          { id: 'credit-notes',         label: 'Credit Notes',         path: '/operations/sales/revenue/credit-notes' },
          { id: 'revenue-recognition',  label: 'Revenue Recognition',  path: '/operations/sales/revenue/revenue-recognition' },
          { id: 'deferred-revenue',     label: 'Deferred Revenue',     path: '/operations/sales/revenue/deferred-revenue' },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Expenses (Procure-to-Pay)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'expenses',
    label: 'Expenses (Procure-to-Pay)',
    subsections: [
      {
        id: 'purchasing',
        label: 'Purchasing',
        tabs: [
          { id: 'vendors',              label: 'Vendors',              path: '/operations/expenses/purchasing/vendors' },
          { id: 'purchase-requests',    label: 'Purchase Requests',    path: '/operations/expenses/purchasing/purchase-requests' },
          { id: 'purchase-orders',      label: 'Purchase Orders',      path: '/operations/expenses/purchasing/purchase-orders' },
          { id: 'rfq',                  label: 'RFQ',                  path: '/operations/expenses/purchasing/rfq' },
          { id: 'approvals',            label: 'Approvals',            path: '/operations/expenses/purchasing/approvals' },
        ],
      },
      {
        id: 'bills-payments',
        label: 'Bills & Payments',
        tabs: [
          { id: 'bills',                label: 'Bills',                path: '/operations/expenses/bills-payments/bills' },
          { id: 'recurring-bills',      label: 'Recurring Bills',      path: '/operations/expenses/bills-payments/recurring-bills' },
          { id: 'bill-payments',        label: 'Bill Payments',        path: '/operations/expenses/bills-payments/bill-payments' },
          { id: 'payment-runs',         label: 'Payment Runs',         path: '/operations/expenses/bills-payments/payment-runs' },
          { id: 'vendor-credits',       label: 'Vendor Credits',       path: '/operations/expenses/bills-payments/vendor-credits' },
          { id: 'ap-aging',             label: 'A/P Aging',            path: '/operations/expenses/bills-payments/ap-aging' },
        ],
      },
      {
        id: 'expense-capture',
        label: 'Expense Capture',
        tabs: [
          { id: 'expenses',             label: 'Expenses',             path: '/operations/expenses/expense-capture/expenses' },
          { id: 'receipts',             label: 'Receipts',             path: '/operations/expenses/expense-capture/receipts' },
          { id: 'mileage',              label: 'Mileage',              path: '/operations/expenses/expense-capture/mileage' },
          { id: 'per-diem',             label: 'Per Diem',             path: '/operations/expenses/expense-capture/per-diem' },
          { id: 'reimbursements',       label: 'Reimbursements',       path: '/operations/expenses/expense-capture/reimbursements' },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Inventory
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'inventory',
    label: 'Inventory',
    subsections: [
      {
        id: 'items',
        label: 'Items',
        tabs: [
          { id: 'inventory-items',      label: 'Inventory Items',      path: '/operations/inventory/items/inventory-items' },
          { id: 'categories',           label: 'Categories',           path: '/operations/inventory/items/categories' },
          { id: 'bundles',              label: 'Bundles',              path: '/operations/inventory/items/bundles' },
          { id: 'units-of-measure',     label: 'Units of Measure',     path: '/operations/inventory/items/units-of-measure' },
        ],
      },
      {
        id: 'operations',
        label: 'Operations',
        tabs: [
          { id: 'item-receipts',        label: 'Item Receipts',        path: '/operations/inventory/operations/item-receipts' },
          { id: 'stock-movements',      label: 'Stock Movements',      path: '/operations/inventory/operations/stock-movements' },
          { id: 'adjustments',          label: 'Adjustments',          path: '/operations/inventory/operations/adjustments' },
          { id: 'transfers',            label: 'Transfers',            path: '/operations/inventory/operations/transfers' },
        ],
      },
      {
        id: 'warehousing',
        label: 'Warehousing',
        tabs: [
          { id: 'warehouses',           label: 'Warehouses',           path: '/operations/inventory/warehousing/warehouses' },
          { id: 'bin-locations',        label: 'Bin Locations',        path: '/operations/inventory/warehousing/bin-locations' },
          { id: 'zones',                label: 'Zones',                path: '/operations/inventory/warehousing/zones' },
        ],
      },
      {
        id: 'control',
        label: 'Control',
        tabs: [
          { id: 'cycle-counts',         label: 'Cycle Counts',         path: '/operations/inventory/control/cycle-counts' },
          { id: 'physical-counts',      label: 'Physical Counts',      path: '/operations/inventory/control/physical-counts' },
          { id: 'lot-serial-tracking',  label: 'Lot/Serial Tracking',  path: '/operations/inventory/control/lot-serial-tracking' },
          { id: 'reorder-points',       label: 'Reorder Points',       path: '/operations/inventory/control/reorder-points' },
          { id: 'safety-stock',         label: 'Safety Stock',         path: '/operations/inventory/control/safety-stock' },
        ],
      },
      {
        id: 'valuation',
        label: 'Valuation',
        tabs: [
          { id: 'inventory-valuation',  label: 'Inventory Valuation',  path: '/operations/inventory/valuation/inventory-valuation' },
          { id: 'landed-costs',         label: 'Landed Costs',         path: '/operations/inventory/valuation/landed-costs' },
          { id: 'cost-adjustments',     label: 'Cost Adjustments',     path: '/operations/inventory/valuation/cost-adjustments' },
          { id: 'write-downs',          label: 'Write-Downs',          path: '/operations/inventory/valuation/write-downs' },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Projects
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'projects',
    label: 'Projects',
    subsections: [
      {
        id: 'setup',
        label: 'Setup',
        tabs: [
          { id: 'projects',             label: 'Projects',             path: '/operations/projects/setup/projects' },
          { id: 'project-templates',    label: 'Project Templates',    path: '/operations/projects/setup/project-templates' },
          { id: 'milestones',           label: 'Milestones',           path: '/operations/projects/setup/milestones' },
          { id: 'contracts',            label: 'Contracts',            path: '/operations/projects/setup/contracts' },
        ],
      },
      {
        id: 'execution',
        label: 'Execution',
        tabs: [
          { id: 'project-tasks',        label: 'Project Tasks',        path: '/operations/projects/execution/project-tasks' },
          { id: 'schedule',             label: 'Schedule',             path: '/operations/projects/execution/schedule' },
          { id: 'resource-planning',    label: 'Resource Planning',    path: '/operations/projects/execution/resource-planning' },
          { id: 'time-expenses',        label: 'Time & Expenses',      path: '/operations/projects/execution/time-expenses' },
        ],
      },
      {
        id: 'billing',
        label: 'Billing',
        tabs: [
          { id: 'project-billing',      label: 'Project Billing',      path: '/operations/projects/billing/project-billing' },
          { id: 'progress-billing',     label: 'Progress Billing',     path: '/operations/projects/billing/progress-billing' },
          { id: 'milestone-billing',    label: 'Milestone Billing',    path: '/operations/projects/billing/milestone-billing' },
          { id: 'change-orders',        label: 'Change Orders',        path: '/operations/projects/billing/change-orders' },
          { id: 'wip',                  label: 'WIP',                  path: '/operations/projects/billing/wip' },
        ],
      },
      {
        id: 'financials',
        label: 'Financials',
        tabs: [
          { id: 'project-profitability',label: 'Project Profitability',path: '/operations/projects/financials/project-profitability' },
          { id: 'budget-vs-actual',     label: 'Budget vs Actual',     path: '/operations/projects/financials/budget-vs-actual' },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 6. Time
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'time',
    label: 'Time',
    subsections: [
      {
        id: 'entry',
        label: 'Entry',
        tabs: [
          { id: 'time-entries',         label: 'Time Entries',         path: '/operations/time/entry/time-entries' },
          { id: 'timesheets',           label: 'Timesheets',           path: '/operations/time/entry/timesheets' },
          { id: 'timer',                label: 'Timer',                path: '/operations/time/entry/timer' },
        ],
      },
      {
        id: 'review',
        label: 'Review',
        tabs: [
          { id: 'billable-time-review', label: 'Billable Time Review', path: '/operations/time/review/billable-time-review' },
          { id: 'time-approvals',       label: 'Time Approvals',       path: '/operations/time/review/time-approvals' },
        ],
      },
    ],
  },
]

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Find a section by its id. Returns undefined if not found. */
export function findSection(sectionId: string): OperationsSection | undefined {
  return OPERATIONS_NAV.find((s) => s.id === sectionId)
}

/** Find a subsection within a section by its id. */
export function findSubsection(
  sectionId: string,
  subsectionId: string,
): NavSubsection | undefined {
  return findSection(sectionId)?.subsections.find((sub) => sub.id === subsectionId)
}

/** Find a tab within a subsection by its id. */
export function findTab(
  sectionId: string,
  subsectionId: string,
  tabId: string,
): NavTab | undefined {
  return findSubsection(sectionId, subsectionId)?.tabs.find((t) => t.id === tabId)
}

/**
 * Given a pathname (e.g. '/banking-cash/accounts/credit-cards'), return the
 * matching { section, subsection, tab } tuple, or null if not found.
 */
export function resolveNavFromPath(pathname: string): {
  section: OperationsSection
  subsection: NavSubsection
  tab: NavTab
} | null {
  for (const section of OPERATIONS_NAV) {
    for (const subsection of section.subsections) {
      for (const tab of subsection.tabs) {
        if (tab.path === pathname) {
          return { section, subsection, tab }
        }
      }
    }
  }
  return null
}
