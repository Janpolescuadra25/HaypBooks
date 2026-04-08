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
          { id: 'customers',            label: 'Customers',            path: '/sales/customers/customers' },
          { id: 'customer-groups',      label: 'Customer Groups',      path: '/sales/customers/customer-groups' },
          { id: 'price-lists',          label: 'Price Lists',          path: '/sales/customers/price-lists' },
          { id: 'customer-portal',      label: 'Customer Portal',      path: '/sales/customers/customer-portal' },
        ],
      },
      {
        id: 'sales',
        label: 'Sales',
        tabs: [
          { id: 'products-services',    label: 'Products & Services',  path: '/sales/sales/products-services' },
          { id: 'quotes',               label: 'Quotes',               path: '/sales/sales/quotes' },
          { id: 'sales-orders',         label: 'Sales Orders',         path: '/sales/sales/sales-orders' },
        ],
      },
      {
        id: 'billing',
        label: 'Billing',
        tabs: [
          { id: 'invoices',             label: 'Invoices',             path: '/sales/billing/invoices' },
          { id: 'recurring-invoices',   label: 'Recurring Invoices',   path: '/sales/billing/recurring-invoices' },
          { id: 'subscriptions',        label: 'Subscriptions',        path: '/sales/billing/subscriptions' },
          { id: 'payment-links',        label: 'Payment Links',        path: '/sales/billing/payment-links' },
        ],
      },
      {
        id: 'collections',
        label: 'Collections',
        tabs: [
          { id: 'customer-payments',    label: 'Customer Payments',    path: '/sales/collections/customer-payments' },
          { id: 'ar-aging',             label: 'A/R Aging',            path: '/sales/collections/ar-aging' },
          { id: 'collections-center',   label: 'Collections Center',   path: '/sales/collections/collections-center' },
          { id: 'dunning',              label: 'Dunning',              path: '/sales/collections/dunning' },
          { id: 'write-offs',           label: 'Write-Offs',           path: '/sales/collections/write-offs' },
          { id: 'refunds',              label: 'Refunds',              path: '/sales/collections/refunds' },
        ],
      },
      {
        id: 'revenue',
        label: 'Revenue',
        tabs: [
          { id: 'credit-notes',         label: 'Credit Notes',         path: '/sales/revenue/credit-notes' },
          { id: 'revenue-recognition',  label: 'Revenue Recognition',  path: '/sales/revenue/revenue-recognition' },
          { id: 'deferred-revenue',     label: 'Deferred Revenue',     path: '/sales/revenue/deferred-revenue' },
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
          { id: 'vendors',              label: 'Vendors',              path: '/expenses/vendors/vendors' },
          { id: 'purchase-requests',    label: 'Purchase Requests',    path: '/expenses/vendors/purchase-requests' },
          { id: 'purchase-orders',      label: 'Purchase Orders',      path: '/expenses/vendors/purchase-orders' },
          { id: 'rfq',                  label: 'RFQ',                  path: '/expenses/vendors/rfq' },
          { id: 'approvals',            label: 'Approvals',            path: '/expenses/vendors/approvals' },
        ],
      },
      {
        id: 'bills-payments',
        label: 'Bills & Payments',
        tabs: [
          { id: 'bills',                label: 'Bills',                path: '/expenses/payables/bills' },
          { id: 'recurring-bills',      label: 'Recurring Bills',      path: '/expenses/payables/recurring-bills' },
          { id: 'bill-payments',        label: 'Bill Payments',        path: '/expenses/payables/bill-payments' },
          { id: 'payment-runs',         label: 'Payment Runs',         path: '/expenses/payables/payment-runs' },
          { id: 'vendor-credits',       label: 'Vendor Credits',       path: '/expenses/payables/vendor-credits' },
          { id: 'ap-aging',             label: 'A/P Aging',            path: '/expenses/payables/ap-aging' },
        ],
      },
      {
        id: 'expense-capture',
        label: 'Expense Capture',
        tabs: [
          { id: 'expenses',             label: 'Expenses',             path: '/expenses/expense-capture/expenses' },
          { id: 'receipts',             label: 'Receipts',             path: '/expenses/expense-capture/receipts' },
          { id: 'mileage',              label: 'Mileage',              path: '/expenses/expense-capture/mileage' },
          { id: 'per-diem',             label: 'Per Diem',             path: '/expenses/expense-capture/per-diem' },
          { id: 'reimbursements',       label: 'Reimbursements',       path: '/expenses/expense-capture/reimbursements' },
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
          { id: 'inventory-items',      label: 'Inventory Items',      path: '/inventory/setup/inventory-items' },
          { id: 'categories',           label: 'Categories',           path: '/inventory/setup/categories' },
          { id: 'bundles',              label: 'Bundles',              path: '/inventory/setup/bundles' },
          { id: 'units-of-measure',     label: 'Units of Measure',     path: '/inventory/setup/units-of-measure' },
        ],
      },
      {
        id: 'operations',
        label: 'Operations',
        tabs: [
          { id: 'item-receipts',        label: 'Item Receipts',        path: '/inventory/stock-operations/item-receipts' },
          { id: 'stock-movements',      label: 'Stock Movements',      path: '/inventory/stock-operations/stock-movements' },
          { id: 'adjustments',          label: 'Adjustments',          path: '/inventory/stock-operations/inventory-adjustments' },
          { id: 'transfers',            label: 'Transfers',            path: '/inventory/stock-operations/transfers' },
        ],
      },
      {
        id: 'warehousing',
        label: 'Warehousing',
        tabs: [
          { id: 'warehouses',           label: 'Warehouses',           path: '/inventory/warehouses/warehouse-list' },
          { id: 'bin-locations',        label: 'Bin Locations',        path: '/inventory/warehousing/bin-locations' },
          { id: 'zones',                label: 'Zones',                path: '/inventory/warehousing/stock-zones' },
        ],
      },
      {
        id: 'control',
        label: 'Control',
        tabs: [
          { id: 'cycle-counts',         label: 'Cycle Counts',         path: '/inventory/stock-operations/cycle-counts' },
          { id: 'physical-counts',      label: 'Physical Counts',      path: '/inventory/stock-operations/physical-counts' },
          { id: 'lot-serial-tracking',  label: 'Lot/Serial Tracking',  path: '/inventory/control/lot-serial-tracking' },
          { id: 'reorder-points',       label: 'Reorder Points',       path: '/inventory/control/reorder-points' },
          { id: 'safety-stock',         label: 'Safety Stock',         path: '/inventory/control/safety-stock' },
        ],
      },
      {
        id: 'valuation',
        label: 'Valuation',
        tabs: [
          { id: 'inventory-valuation',  label: 'Inventory Valuation',  path: '/inventory/valuation/inventory-valuation' },
          { id: 'landed-costs',         label: 'Landed Costs',         path: '/inventory/costing/landed-costs' },
          { id: 'cost-adjustments',     label: 'Cost Adjustments',     path: '/inventory/costing/cost-adjustments' },
          { id: 'write-downs',          label: 'Write-Downs',          path: '/inventory/valuation/write-downs' },
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
          { id: 'projects',             label: 'Projects',             path: '/projects/project-setup/projects' },
          { id: 'project-templates',    label: 'Project Templates',    path: '/projects/project-setup/project-templates' },
          { id: 'milestones',           label: 'Milestones',           path: '/projects/project-setup/milestones' },
          { id: 'contracts',            label: 'Contracts',            path: '/projects/project-setup/contracts' },
        ],
      },
      {
        id: 'execution',
        label: 'Execution',
        tabs: [
          { id: 'project-tasks',        label: 'Project Tasks',        path: '/projects/project-setup/project-tasks' },
          { id: 'schedule',             label: 'Schedule',             path: '/projects/planning/schedule' },
          { id: 'resource-planning',    label: 'Resource Planning',    path: '/projects/planning/resource-planning' },
          { id: 'time-expenses',        label: 'Time & Expenses',      path: '/projects/time-billing/timesheets' },
        ],
      },
      {
        id: 'billing',
        label: 'Billing',
        tabs: [
          { id: 'project-billing',      label: 'Project Billing',      path: '/projects/billing/project-billing' },
          { id: 'progress-billing',     label: 'Progress Billing',     path: '/projects/billing/progress-billing' },
          { id: 'milestone-billing',    label: 'Milestone Billing',    path: '/projects/billing/milestone-billing' },
          { id: 'change-orders',        label: 'Change Orders',        path: '/projects/billing/change-orders' },
          { id: 'wip',                  label: 'WIP',                  path: '/projects/billing/work-in-progress' },
        ],
      },
      {
        id: 'financials',
        label: 'Financials',
        tabs: [
          { id: 'project-profitability',label: 'Project Profitability',path: '/projects/financials/project-profitability' },
          { id: 'budget-vs-actual',     label: 'Budget vs Actual',     path: '/projects/financials/budget-vs-actual' },
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
          { id: 'time-entries',         label: 'Time Entries',         path: '/time/entry/time-entries' },
          { id: 'timesheets',           label: 'Timesheets',           path: '/time/entry/timesheets' },
          { id: 'timer',                label: 'Timer',                path: '/time/entry/timer' },
        ],
      },
      {
        id: 'review',
        label: 'Review',
        tabs: [
          { id: 'billable-time-review', label: 'Billable Time Review', path: '/time/review/billable-time-review' },
          { id: 'time-approvals',       label: 'Time Approvals',       path: '/time/review/time-approvals' },
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
