// Owner Books — Navigation Configuration
// Paths mapped to actual Next.js (owner) route structure

import {
  Home,
  CheckSquare,
  Building2,
  Landmark,
  DollarSign,
  CreditCard,
  Package,
  HeartHandshake,
  Store,
  FolderKanban,
  Clock,
  Users,
  Receipt,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Zap,
  UserCog,
  Wallet,
  Plug,
  Brain,
  Flag,
  Settings,
  Briefcase,
  FileCheck,
} from 'lucide-react'


export interface NavTab {
  label: string
  value: string
  status: 'existing' | 'ghost-fix' | 'coming-soon'
}

export interface NavItem {
  title: string
  /** Display label (alias for title used by slug pages) */
  label?: string
  path?: string
  /** href alias for path used by slug/router pages */
  href?: string
  items?: NavItem[]
  /** Tabs shown in ModuleTabs bar when this group is active */
  tabs?: NavTab[]
  isEnterprise?: boolean
  /** When true, render as a visual section divider (not clickable) */
  isSectionLabel?: boolean
  /** Restrict visibility to specific country codes (ISO2) */
  countries?: string[]
}

export interface NavGroup {
  title?: string
  items: NavItem[]
  /** Restrict visibility to specific country codes (ISO2) */
  countries?: string[]
}

export interface NavSection {
  title: string
  /** Short label shown in the primary rail button (max ~8 chars). Falls back to first word of title. */
  label?: string
  /** Section identifier used by [[...slug]] routing pages */
  id?: string
  icon: any
  items?: NavItem[]
  /** Grouped navigation items used by [[...slug]] routing pages */
  groups?: NavGroup[]
  isEnterprise?: boolean
  /** Restrict visibility to specific country codes (ISO2) */
  countries?: string[]
}

export const navigationData: NavSection[] = [
  {
    title: 'HOME',
    label: 'HOME',
    icon: Home,
    items: [
      { title: 'Dashboard', path: '/home/dashboard' },
      { title: 'Business Health', path: '/home/business-health' },
      { title: 'Business Performance', path: '/home/performance' },
      { title: 'Shortcuts', path: '/home/shortcuts' },
      { title: 'Setup Checklist', path: '/home/setup-center' },
      { title: 'Notifications', path: '/home/notifications' },
    ],
  },
  {
    title: 'OPERATIONS',
    label: 'OPS',
    icon: Briefcase,
    // ── Nested 2-level structure: sections → subsections ──────────────────────
    groups: [
      {
        title: 'Cash & Banking',
        items: [
          {
            title: 'Bank Transactions',
            path: '/banking-cash/transactions',
            tabs: [
              { label: 'Bank Transactions', value: 'transactions', status: 'existing' },
              { label: 'Bank Rules',        value: 'rules',        status: 'existing' },
            ],
          },
          {
            title: 'Accounts',
            path: '/banking-cash/accounts',
            tabs: [
              { label: 'Bank Accounts',     value: 'bank-accounts',     status: 'existing' },
              { label: 'Credit Cards',      value: 'credit-cards',      status: 'coming-soon' },
              { label: 'Petty Cash',        value: 'petty-cash',        status: 'coming-soon' },
              { label: 'Clearing Accounts', value: 'clearing-accounts', status: 'coming-soon' },
            ],
          },
          {
            title: 'Reconciliation',
            path: '/banking-cash/reconciliation',
            tabs: [
              { label: 'Reconcile',  value: 'reconcile',  status: 'coming-soon' },
              { label: 'History',    value: 'history',    status: 'coming-soon' },
              { label: 'Statements', value: 'statements', status: 'coming-soon' },
            ],
          },
          {
            title: 'Deposits',
            path: '/banking-cash/deposits',
            tabs: [
              { label: 'Undeposited Funds', value: 'undeposited-funds', status: 'coming-soon' },
              { label: 'Bank Deposits',     value: 'bank-deposits',     status: 'coming-soon' },
              { label: 'Deposit History',   value: 'deposit-history',   status: 'coming-soon' },
            ],
          },
        ],
      },
      {
        title: 'Sales (Order-to-Cash)',
        items: [
          {
            title: 'Customers',
            path: '/sales/customers',
            tabs: [
              { label: 'Customers',   value: 'customers',   status: 'existing' },
              { label: 'Groups',      value: 'groups',      status: 'coming-soon' },
              { label: 'Price Lists', value: 'price-lists', status: 'coming-soon' },
              { label: 'Portal',      value: 'portal',      status: 'coming-soon' },
            ],
          },
          {
            title: 'Sales Orders',
            path: '/sales/sales-operations',
            tabs: [
              { label: 'Products & Services', value: 'products-services', status: 'coming-soon' },
              { label: 'Quotes',              value: 'quotes',            status: 'coming-soon' },
              { label: 'Sales Orders',        value: 'sales-orders',      status: 'coming-soon' },
            ],
          },
          {
            title: 'Billing',
            path: '/sales/billing',
            tabs: [
              { label: 'Invoices',           value: 'invoices',           status: 'existing' },
              { label: 'Recurring Invoices', value: 'recurring-invoices', status: 'existing' },
              { label: 'Subscriptions',      value: 'subscriptions',      status: 'coming-soon' },
              { label: 'Payment Links',      value: 'payment-links',      status: 'coming-soon' },
            ],
          },
          {
            title: 'Collections',
            path: '/sales/collections',
            tabs: [
              { label: 'Payments',            value: 'payments',            status: 'ghost-fix' },
              { label: 'A/R Aging',           value: 'ar-aging',            status: 'ghost-fix' },
              { label: 'Collections Center',  value: 'collections-center',  status: 'ghost-fix' },
              { label: 'Dunning',             value: 'dunning',             status: 'coming-soon' },
              { label: 'Write-Offs',          value: 'write-offs',          status: 'coming-soon' },
              { label: 'Refunds',             value: 'refunds',             status: 'coming-soon' },
            ],
          },
          {
            title: 'Revenue',
            path: '/sales/revenue',
            tabs: [
              { label: 'Credit Notes',          value: 'credit-notes',          status: 'ghost-fix' },
              { label: 'Revenue Recognition',   value: 'revenue-recognition',   status: 'coming-soon' },
              { label: 'Deferred Revenue',      value: 'deferred-revenue',      status: 'coming-soon' },
            ],
          },
        ],
      },
      {
        title: 'Expenses (Procure-to-Pay)',
        items: [
          {
            title: 'Purchasing',
            path: '/expenses/purchasing',
            tabs: [
              { label: 'Vendors',            value: 'vendors',            status: 'existing' },
              { label: 'Purchase Requests',  value: 'purchase-requests',  status: 'coming-soon' },
              { label: 'Orders',             value: 'orders',             status: 'coming-soon' },
              { label: 'RFQ',                value: 'rfq',                status: 'coming-soon' },
              { label: 'Approvals',          value: 'approvals',          status: 'coming-soon' },
            ],
          },
          {
            title: 'Bills & Payments',
            path: '/expenses/payables',
            tabs: [
              { label: 'Bills',             value: 'bills',             status: 'existing' },
              { label: 'Recurring Bills',   value: 'recurring-bills',   status: 'coming-soon' },
              { label: 'Bill Payments',     value: 'bill-payments',     status: 'existing' },
              { label: 'Payment Runs',      value: 'payment-runs',      status: 'coming-soon' },
              { label: 'Vendor Credits',    value: 'vendor-credits',    status: 'coming-soon' },
            ],
          },
          {
            title: 'Expense Capture',
            path: '/expenses/expense-capture',
            tabs: [
              { label: 'Expenses',         value: 'expenses',         status: 'coming-soon' },
              { label: 'Receipts',         value: 'receipts',         status: 'coming-soon' },
              { label: 'Mileage',          value: 'mileage',          status: 'coming-soon' },
              { label: 'Per Diem',         value: 'per-diem',         status: 'coming-soon' },
              { label: 'Reimbursements',   value: 'reimbursements',   status: 'coming-soon' },
            ],
          },
        ],
      },
      {
        title: 'Inventory',
        items: [
          {
            title: 'Items',
            path: '/inventory/items',
            tabs: [
              { label: 'Inventory Items', value: 'item-list',    status: 'existing' },
              { label: 'Categories',      value: 'categories',   status: 'coming-soon' },
              { label: 'Bundles',         value: 'bundles',      status: 'coming-soon' },
              { label: 'Units',           value: 'units',        status: 'coming-soon' },
            ],
          },
          {
            title: 'Operations',
            path: '/inventory/stock-operations',
            tabs: [
              { label: 'Item Receipts',    value: 'item-receipts',    status: 'existing' },
              { label: 'Stock Movements',  value: 'stock-movements',  status: 'coming-soon' },
              { label: 'Adjustments',      value: 'adjustments',      status: 'coming-soon' },
              { label: 'Transfers',        value: 'transfers',        status: 'coming-soon' },
            ],
          },
          {
            title: 'Warehousing',
            path: '/inventory/warehouses',
            tabs: [
              { label: 'Warehouses',    value: 'warehouse-list', status: 'existing' },
              { label: 'Bin Locations', value: 'bin-locations', status: 'coming-soon' },
              { label: 'Zones',         value: 'zones',         status: 'coming-soon' },
            ],
          },
          {
            title: 'Control',
            path: '/inventory/control',
            tabs: [
              { label: 'Cycle Counts',      value: 'cycle-counts',      status: 'coming-soon' },
              { label: 'Physical Counts',   value: 'physical-counts',   status: 'coming-soon' },
              { label: 'Lot/Serial Tracking', value: 'lot-serial-tracking', status: 'coming-soon' },
              { label: 'Reorder Points',    value: 'reorder-points',    status: 'coming-soon' },
            ],
          },
          {
            title: 'Valuation',
            path: '/inventory/valuation',
            tabs: [
              { label: 'Valuation',         value: 'inventory-valuation', status: 'existing' },
              { label: 'Landed Costs',      value: 'landed-costs',      status: 'coming-soon' },
              { label: 'Cost Adjustments',  value: 'cost-adjustments',  status: 'coming-soon' },
              { label: 'Write-Downs',       value: 'write-downs',       status: 'coming-soon' },
            ],
          },
        ],
      },
      {
        title: 'Projects',
        items: [
          {
            title: 'Setup',
            path: '/projects/project-setup',
            tabs: [
              { label: 'Projects',   value: 'projects',   status: 'existing' },
              { label: 'Templates',  value: 'templates',  status: 'coming-soon' },
              { label: 'Milestones', value: 'milestones', status: 'coming-soon' },
              { label: 'Contracts',  value: 'contracts',  status: 'coming-soon' },
            ],
          },
          {
            title: 'Execution',
            path: '/projects/tasks',
            tabs: [
              { label: 'Tasks',              value: 'task-list',          status: 'existing' },
              { label: 'Schedule',           value: 'schedule',           status: 'coming-soon' },
              { label: 'Resource Planning',  value: 'resource-planning',  status: 'coming-soon' },
              { label: 'Time & Expenses',    value: 'time-expenses',      status: 'coming-soon' },
            ],
          },
          {
            title: 'Billing',
            path: '/projects/billing',
            tabs: [
              { label: 'Project Billing',   value: 'project-billing',   status: 'coming-soon' },
              { label: 'Progress Billing',  value: 'progress-billing',  status: 'coming-soon' },
              { label: 'Change Orders',     value: 'change-orders',     status: 'coming-soon' },
              { label: 'WIP',               value: 'wip',               status: 'coming-soon' },
            ],
          },
          {
            title: 'Financials',
            path: '/projects/financials',
            tabs: [
              { label: 'Project Profitability', value: 'profitability',      status: 'coming-soon' },
              { label: 'Budget vs Actual',      value: 'budget-vs-actual',   status: 'coming-soon' },
            ],
          },
        ],
      },
      {
        title: 'Time',
        items: [
          {
            title: 'Entry',
            path: '/time/entry',
            tabs: [
              { label: 'Time Entries', value: 'time-entries', status: 'existing' },
              { label: 'Timesheets',   value: 'timesheets',   status: 'coming-soon' },
              { label: 'Timer',        value: 'timer',        status: 'coming-soon' },
            ],
          },
          {
            title: 'Review',
            path: '/time/review',
            tabs: [
              { label: 'Billable Review', value: 'billable-time-review', status: 'coming-soon' },
              { label: 'Time Approvals',  value: 'time-approvals',   status: 'coming-soon' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'ACCOUNTING',
    label: 'ACCT',
    icon: ShieldCheck,
    groups: [
      {
        title: 'Setup',
        items: [
          { title: 'Chart of Accounts', path: '/accounting/core-accounting/chart-of-accounts' },
        ],
      },
      {
        title: 'Transactions',
        items: [
          { title: 'Journal Entries', path: '/accounting/core-accounting/journal-entries' },
          { title: 'General Ledger', path: '/accounting/core-accounting/general-ledger' },
        ],
      },
      {
        title: 'Period Close',
        items: [
          { title: 'Close Workflow', path: '/accounting/close-workflow' },
          { title: 'Multi-Currency Revaluation', path: '/accounting/period-close/multi-currency-revaluation' },
          { title: 'Lock Period', path: '/accounting/period-close/lock-period' },
          { title: 'Sign-Offs', path: '/accounting/period-close/sign-offs' },
          { title: 'Close Archive', path: '/accounting/period-close/close-archive' },
        ],
      },
      {
        title: 'Allocations',
        items: [
          { title: 'Allocation Rules', path: '/accounting/allocations/allocation-rules' },
          { title: 'Allocation Runs', path: '/accounting/allocations/allocation-runs' },
          { title: 'Allocation History', path: '/accounting/allocations/allocation-history' },
        ],
      },
      {
        title: 'Fixed Assets',
        items: [
          { title: 'Asset Management', path: '/accounting/fixed-assets/asset-management' },
          { title: 'Depreciation', path: '/accounting/fixed-assets/depreciation' },
          { title: 'Asset Lifecycle', path: '/accounting/fixed-assets/asset-lifecycle' },
          { title: 'Insurance', path: '/accounting/fixed-assets/insurance' },
        ],
      },
    ],
  },
  {
    title: 'PAYROLL',
    label: 'PAYROLL',
    icon: Users,
    groups: [
      {
        title: 'Workforce',
        items: [
          { title: 'Employees', path: '/payroll-workforce/workforce/employees' },
          { title: 'Job Positions', path: '/payroll-workforce/workforce/job-positions' },
          { title: 'Employee Documents', path: '/payroll-workforce/workforce/employee-documents' },
        ],
      },
      {
        title: 'Time & Leave',
        items: [
          { title: 'Leave Requests', path: '/payroll-workforce/time-leave/leave-requests' },
          { title: 'Leave Balances', path: '/payroll-workforce/time-leave/leave-balances' },
          { title: 'Holiday Calendar', path: '/payroll-workforce/time-leave/holiday-calendar' },
          { title: 'Shift Scheduling', path: '/payroll-workforce/time-leave/shift-scheduling' },
        ],
      },
      {
        title: 'Payroll Processing',
        items: [
          { title: 'Payroll Runs', path: '/payroll-workforce/payroll-processing/payroll-runs' },
          { title: 'Payroll Adjustments', path: '/payroll-workforce/payroll-processing/payroll-adjustments' },
          { title: 'Bonuses & Commissions', path: '/payroll-workforce/payroll-processing/bonuses-commissions' },
          { title: 'Final Pay', path: '/payroll-workforce/payroll-processing/final-pay' },
          { title: 'Payroll Approvals', path: '/payroll-workforce/payroll-processing/payroll-approvals' },
          { title: 'Payroll History', path: '/payroll-workforce/payroll-processing/payroll-history' },
        ],
      },
      {
        title: 'Compensation',
        items: [
          { title: 'Salary Structures', path: '/payroll-workforce/compensation/salary-structures' },
          { title: 'Allowances', path: '/payroll-workforce/compensation/allowances' },
          { title: 'Deductions', path: '/payroll-workforce/compensation/deductions' },
          { title: 'Loans', path: '/payroll-workforce/compensation/loans' },
          { title: 'Benefit Plans', path: '/payroll-workforce/compensation/benefit-plans' },
        ],
      },
      {
        title: 'Statutory',
        items: [
          { title: 'Tax Withholding', path: '/payroll-workforce/payroll-taxes/tax-withholding' },
          { title: 'Government Contributions', path: '/payroll-workforce/payroll-taxes/government-contributions' },
          { title: 'Remittance Tracking', path: '/payroll-workforce/payroll-taxes/remittance-tracking' },
        ],
      },
    ],
  },
  {
    title: 'TAXES',
    label: 'TAX',
    icon: Receipt,
    groups: [
      {
        title: 'Tax Center',
        items: [
          { title: 'Tax Dashboard',    path: '/taxes/tax-center/tax-dashboard' },
          { title: 'Tax Liabilities',  path: '/taxes/tax-center/tax-liabilities' },
          { title: 'Filing & Payments', path: '/taxes/tax-center/filing-payments' },
          { title: 'Tax Calendar',     path: '/taxes/tax-center/tax-calendar' },
        ],
      },
      {
        title: 'Tax Setup',
        items: [
          { title: 'Tax Agencies', path: '/taxes/tax-setup/tax-agencies' },
          { title: 'Tax Rates & Codes', path: '/taxes/tax-setup/tax-rates' },
        ],
      },
      {
        title: 'Reporting & Filing',
        items: [
          { title: 'Tax Summary', path: '/taxes/tax-reporting/tax-summary' },
          { title: 'VAT Payable', path: '/taxes/tax-reporting/vat-payable' },
          { title: 'Tax Returns', path: '/taxes/filing-payments/tax-returns' },
          { title: 'E-Filing', path: '/taxes/filing-payments/e-filing' },
        ],
      },
    ],
  },
  {
    title: 'REPORTING',
    label: 'REPORTS',
    icon: BarChart3,
    groups: [
      {
        title: 'Financial Statements',
        items: [
          { title: 'Balance Sheet', path: '/reporting/reports-center/financial-statements/balance-sheet' },
          { title: 'Profit & Loss', path: '/reporting/reports-center/financial-statements/profit-and-loss' },
          { title: 'Cash Flow Statement', path: '/reporting/reports-center/financial-statements/cash-flow-statement' },
        ],
      },
      {
        title: 'Accountant Reports',
        items: [
          { title: 'Trial Balance', path: '/reporting/reports-center/accountant-reports/trial-balance' },
          { title: 'General Ledger Report', path: '/reporting/reports-center/accountant-reports/general-ledger' },
        ],
      },
      {
        title: 'Operational Reports',
        items: [
          { title: 'Banking Reports', path: '/reporting/reports-center/banking-reports' },
          { title: 'Sales Reports', path: '/reporting/reports-center/sales-reports' },
          { title: 'Expense Reports', path: '/reporting/reports-center/expense-reports' },
          { title: 'Inventory Reports', path: '/reporting/reports-center/inventory-reports' },
          { title: 'Project Reports', path: '/reporting/reports-center/project-reports' },
          { title: 'Payroll Reports', path: '/reporting/reports-center/payroll-reports' },
        ],
      },
      {
        title: 'Analytics',
        items: [
          { title: 'KPI Dashboard', path: '/reporting/analytics/analytics-dashboards' },
        ],
      },
      {
        title: 'Custom Reports',
        items: [
          { title: 'Report Builder', path: '/reporting/custom-reports/report-builder' },
          { title: 'Scheduled Reports', path: '/reporting/custom-reports/scheduled-reports' },
        ],
      },
    ],
  },
  {
    title: 'TASKS',
    label: 'TASKS',
    icon: CheckSquare,
    groups: [
      {
        title: 'My Work',
        items: [
          { title: 'My Tasks', path: '/tasks-approvals/my-work/my-tasks' },
          { title: 'My Approvals', path: '/tasks-approvals/my-work/my-approvals' },
          { title: 'My Exceptions', path: '/tasks-approvals/my-work/my-exceptions' },
          { title: 'Overdue Items', path: '/tasks-approvals/my-work/overdue-items' },
          { title: 'Calendar', path: '/tasks-approvals/my-work/calendar' },
        ],
      },
      {
        title: 'Management',
        items: [
          { title: 'Team Tasks', path: '/tasks-approvals/management/team-tasks' },
          { title: 'Delegated Tasks', path: '/tasks-approvals/management/delegated-tasks' },
          { title: 'Approval Queue', path: '/tasks-approvals/management/approval-queue' },
          { title: 'Approval History', path: '/tasks-approvals/management/approval-history' },
          { title: 'Task Templates', path: '/tasks-approvals/management/task-templates' },
        ],
      },
    ],
  },
  {
    title: 'COMPLIANCE',
    label: 'COMPLIANCE',
    icon: FileCheck,
    groups: [
      {
        title: 'Controls',
        items: [
          { title: 'Internal Controls', path: '/compliance/controls/internal-controls' },
          { title: 'Control Testing', path: '/compliance/controls/control-testing' },
          { title: 'Policy Management', path: '/compliance/controls/policy-management' },
        ],
      },
      {
        title: 'Monitoring',
        items: [
          { title: 'Issue Tracking', path: '/compliance/monitoring/issue-tracking' },
          { title: 'Fraud Detection', path: '/compliance/monitoring/fraud-detection-rules' },
          { title: 'Compliance Audit Log', path: '/compliance/monitoring/audit-log-analysis' },
        ],
      },
    ],
  },
  {
    title: 'COLLABORATION',
    label: 'TEAM',
    icon: UserCog,
    groups: [
      {
        title: 'Communication',
        items: [
          { title: 'Client Requests', path: '/accountant-workspace/client-requests' },
        ],
      },
    ],
  },
  {
    title: 'AUTOMATION',
    label: 'AUTO',
    icon: Zap,
    groups: [
      {
        title: 'Workflow Engine',
        items: [
          { title: 'Workflow Builder', path: '/automation/workflow-engine/workflow-builder' },
          { title: 'Smart Rules', path: '/automation/workflow-engine/smart-rules' },
        ],
      },
      {
        title: 'AI & Intelligence',
        items: [
          { title: 'AI Bookkeeping', path: '/automation/ai-intelligence/ai-bookkeeping' },
          { title: 'Smart Matching', path: '/automation/ai-intelligence/smart-matching' },
        ],
      },
      {
        title: 'Monitoring',
        items: [
          { title: 'Automation Logs', path: '/automation/monitoring/automation-logs' },
          { title: 'Error Queue', path: '/automation/monitoring/error-queue' },
        ],
      },
    ],
  },
  {
    title: 'APPS',
    label: 'APPS',
    icon: FolderKanban,
    groups: [
      {
        title: 'Integrations',
        items: [
          { title: 'App Marketplace', path: '/apps-integrations/discover/app-marketplace' },
          { title: 'Connected Apps', path: '/apps-integrations/connected-apps/installed-apps' },
          { title: 'Integration Logs', path: '/apps-integrations/my-integrations/integration-logs' },
        ],
      },
      {
        title: 'Developer',
        items: [
          { title: 'API Keys', path: '/apps-integrations/api/api-keys' },
          { title: 'Webhooks', path: '/apps-integrations/api/webhooks' },
          { title: 'Developer Sandbox', path: '/apps-integrations/developer-tools/developer-sandbox' },
        ],
      },
    ],
  },
  {
    title: 'SETTINGS',
    label: 'SETTINGS',
    icon: Settings,
    groups: [
      {
        title: 'Company Profile',
        items: [
          { title: 'Company Details', path: '/settings/company-profile/company-details' },
          { title: 'Fiscal Year Setup', path: '/settings/company-profile/fiscal-year-setup' },
          { title: 'Base Currency', path: '/settings/entity-management/base-currency' },
        ],
      },
      {
        title: 'Company Structure',
        items: [
          { title: 'Legal Entities', path: '/organization/entity-structure/legal-entities' },
          { title: 'Intercompany Transactions', path: '/organization/entity-structure/intercompany' },
          { title: 'Consolidation', path: '/organization/entity-structure/consolidation' },
          { title: 'Locations & Divisions', path: '/organization/operational-structure/locations-divisions' },
        ],
      },
      {
        title: 'Users & Security',
        items: [
          { title: 'User Management', path: '/settings/users-security/user-management' },
          { title: 'Roles & Permissions', path: '/settings/users-security/roles-permissions' },
          { title: 'Two-Factor Authentication', path: '/settings/users-security/two-factor-auth' },
        ],
      },
      {
        title: 'Preferences',
        items: [
          { title: 'Accounting Preferences', path: '/settings/accounting-preferences' },
          { title: 'Numbering Sequences', path: '/settings/entity-management/numbering-sequences' },
          { title: 'Custom Fields', path: '/settings/customization/custom-fields' },
        ],
      },
      {
        title: 'System',
        items: [
          { title: 'System Audit Log', path: '/settings/data-privacy/audit-log' },
          { title: 'Data Backup', path: '/settings/data-privacy/data-backup' },
          { title: 'Import Data', path: '/apps-integrations/imports/import-data' },
          { title: 'Export Data', path: '/apps-integrations/data-tools/export-data' },
        ],
      },
    ],
  },
]

// Back-compat alias
export const ownerNav = navigationData