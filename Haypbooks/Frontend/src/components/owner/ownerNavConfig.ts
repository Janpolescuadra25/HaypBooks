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
} from 'lucide-react'

export interface NavItem {
  title: string
  /** Display label (alias for title used by slug pages) */
  label?: string
  path?: string
  /** href alias for path used by slug/router pages */
  href?: string
  items?: NavItem[]
  isEnterprise?: boolean
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
  items: NavItem[]
  /** Grouped navigation items used by [[...slug]] routing pages */
  groups?: NavGroup[]
  isEnterprise?: boolean
  /** Restrict visibility to specific country codes (ISO2) */
  countries?: string[]
}

export const navigationData: NavSection[] = [
  {
    title: 'HOME',
    icon: Home,
    items: [
      { title: 'Dashboard', path: '/home/dashboard' },
      { title: 'Business Health', path: '/home/business-health' },
      { title: 'Shortcuts', path: '/home/shortcuts' },
      { title: 'Setup Center', path: '/home/setup-center' },
    ],
  },
  {
    title: 'TASKS & APPROVALS',
    label: 'TASKS',
    icon: CheckSquare,
    items: [
      {
        title: 'My Work',
        items: [
          { title: 'My Tasks', path: '/tasks-approvals/my-work/my-tasks' },
          { title: 'My Approvals', path: '/tasks-approvals/my-work/my-approvals' },
          { title: 'My Exceptions', path: '/tasks-approvals/my-work/my-exceptions' },
          { title: 'Overdue Items', path: '/tasks-approvals/my-work/overdue-items' },
          { title: 'Notifications', path: '/tasks-approvals/my-work/notifications' },
        ],
      },
      {
        title: 'Management',
        items: [
          { title: 'Team Tasks', path: '/tasks-approvals/management/team-tasks' },
          { title: 'Delegated Tasks', path: '/tasks-approvals/management/delegated-tasks' },
          { title: 'Approval Queue', path: '/tasks-approvals/management/approval-queue' },
        ],
      },
      {
        title: 'History',
        items: [
          { title: 'Completed Tasks', path: '/tasks-approvals/history/completed-tasks' },
          { title: 'Approval History', path: '/tasks-approvals/history/approval-history' },
        ],
      },
    ],
  },
  {
    title: 'ORGANIZATION',
    icon: Building2,
    items: [
      {
        title: 'Entity Structure (Legal)',
        items: [
          { title: 'Legal Entities', path: '/organization/entity-structure/legal-entities' },
          { title: 'Intercompany Transactions', path: '/organization/entity-structure/intercompany' },
          { title: 'Consolidation', path: '/organization/entity-structure/consolidation' },
        ],
      },
      {
        title: 'Operational Structure',
        items: [
          { title: 'Locations & Divisions', path: '/organization/operational-structure/locations-divisions' },
          { title: 'Departments', path: '/organization/operational-structure/departments' },
          { title: 'Org Chart', path: '/organization/operational-structure/org-chart' },
        ],
      },
      {
        title: 'Governance',
        items: [
          { title: 'Filing Calendar', path: '/organization/governance/filing-calendar' },
          { title: 'Document Storage', path: '/organization/governance/document-storage' },
        ],
      },
    ],
  },
  {
    title: 'ACCOUNTING',
    icon: BookOpen,
    items: [
      {
        title: 'Core Accounting',
        items: [
          { title: 'Chart of Accounts', path: '/accounting/core-accounting/chart-of-accounts' },
          { title: 'Journal Entries', path: '/accounting/core-accounting/journal-entries' },
          { title: 'General Ledger', path: '/accounting/core-accounting/general-ledger' },
          { title: 'Trial Balance', path: '/accounting/core-accounting/trial-balance' },
        ],
      },
      {
        title: 'Fixed Assets',
        items: [
          {
            title: 'Asset Management',
            items: [
              { title: 'Asset Register', path: '/accounting/fixed-assets/asset-management/asset-register' },
              { title: 'New Asset Entry', path: '/accounting/fixed-assets/asset-management/new-asset' },
              { title: 'Asset Categories', path: '/accounting/fixed-assets/asset-management/asset-categories' },
              { title: 'Asset Locations', path: '/accounting/fixed-assets/asset-management/asset-locations' },
            ],
          },
          {
            title: 'Depreciation',
            items: [
              { title: 'Depreciation Schedules', path: '/accounting/fixed-assets/depreciation/schedules' },
              { title: 'Depreciation Runs', path: '/accounting/fixed-assets/depreciation/runs' },
              { title: 'Depreciation Reports', path: '/accounting/fixed-assets/depreciation/reports' },
            ],
          },
          {
            title: 'Asset Lifecycle',
            items: [
              { title: 'Asset Disposals', path: '/accounting/fixed-assets/lifecycle/disposals' },
              { title: 'Asset Impairments', path: '/accounting/fixed-assets/lifecycle/impairments' },
              { title: 'Asset Revaluations', path: '/accounting/fixed-assets/lifecycle/revaluations' },
              { title: 'Asset Maintenance', path: '/accounting/fixed-assets/lifecycle/maintenance' },
              { title: 'Transfers', path: '/accounting/fixed-assets/lifecycle/transfers', isEnterprise: true },
            ],
          },
          {
            title: 'Insurance',
            items: [
              { title: 'Asset Insurance', path: '/accounting/fixed-assets/insurance/asset-insurance' },
              { title: 'Coverage Tracking', path: '/accounting/fixed-assets/insurance/coverage-tracking' },
              { title: 'Premium Management', path: '/accounting/fixed-assets/insurance/premium-management' },
            ],
          },
          {
            title: 'FA Reports',
            items: [
              { title: 'Fixed Asset Schedule', path: '/accounting/fixed-assets/reports/fixed-asset-schedule' },
              { title: 'Depreciation Summary', path: '/accounting/fixed-assets/reports/depreciation-summary' },
              { title: 'Asset Valuation', path: '/accounting/fixed-assets/reports/asset-valuation' },
              { title: 'Gain / Loss on Disposal', path: '/accounting/fixed-assets/reports/gain-loss-disposal' },
            ],
          },
        ],
      },
      {
        title: 'Planning',
        items: [
          { title: 'Budgets', path: '/accounting/planning/budgets' },
          { title: 'Budget vs Actual', path: '/accounting/planning/budget-vs-actual', isEnterprise: true },
        ],
      },
      {
        title: 'Period Close',
        items: [
          { title: 'Close Checklist', path: '/accounting/period-close/close-checklist' },
          { title: 'Reconciliations', path: '/accounting/period-close/reconciliations' },
          { title: 'Adjustments', path: '/accounting/period-close/adjustments' },
          { title: 'Multi-Currency Revaluation', path: '/accounting/period-close/multi-currency-revaluation', isEnterprise: true },
          { title: 'Lock Period', path: '/accounting/period-close/lock-period' },
          { title: 'Sign-Offs', path: '/accounting/period-close/sign-offs' },
          { title: 'Close Archive', path: '/accounting/period-close/close-archive' },
        ],
      },
    ],
  },
  {
    title: 'BANKING & CASH',
    label: 'BANKING',
    icon: Landmark,
    items: [
      {
        title: 'Bank Connections',
        items: [
          { title: 'Connected Banks', path: '/banking-cash/bank-connections/connected-banks' },
        ],
      },
      {
        title: 'Transactions',
        items: [
          { title: 'Bank Transactions', path: '/banking-cash/transactions/bank-transactions' },
          { title: 'App Transactions', path: '/banking-cash/transactions/app-transactions' },
          { title: 'Transaction Rules', path: '/banking-cash/transactions/transaction-rules' },
          { title: 'Recurring Transactions', path: '/banking-cash/transactions/recurring-transactions' },
        ],
      },
      {
        title: 'Reconciliation',
        items: [
          { title: 'Reconcile', path: '/banking-cash/reconciliation/reconcile' },
          { title: 'Reconciliation History', path: '/banking-cash/reconciliation/history' },
          { title: 'Statement Archive', path: '/banking-cash/reconciliation/statement-archive' },
          { title: 'Reconciliation Reports', path: '/banking-cash/reconciliation/reports' },
        ],
      },
      {
        title: 'Cash Accounts',
        items: [
          { title: 'Bank Accounts', path: '/banking-cash/cash-accounts/bank-accounts' },
          { title: 'Petty Cash', path: '/banking-cash/cash-accounts/petty-cash' },
          { title: 'Clearing Accounts', path: '/banking-cash/cash-accounts/clearing-accounts' },
        ],
      },
      {
        title: 'Deposits',
        items: [
          { title: 'Undeposited Funds', path: '/banking-cash/deposits/undeposited-funds' },
          { title: 'Bank Deposits', path: '/banking-cash/deposits/bank-deposits' },
          { title: 'Deposit Slips', path: '/banking-cash/deposits/deposit-slips' },
        ],
      },
      {
        title: 'Bank Feeds',
        items: [
          { title: 'Feed Connections', path: '/banking-cash/bank-feeds/feed-connections' },
          { title: 'Import Rules', path: '/banking-cash/bank-feeds/import-rules' },
          { title: 'Feed Status', path: '/banking-cash/bank-feeds/feed-status' },
        ],
      },
      {
        title: 'Credit Cards',
        items: [
          { title: 'Credit Card Accounts', path: '/banking-cash/credit-cards/credit-card-accounts' },
          { title: 'Card Transactions', path: '/banking-cash/credit-cards/card-transactions' },
          { title: 'Card Statements', path: '/banking-cash/credit-cards/card-statements' },
        ],
      },
      {
        title: 'Checks',
        items: [
          { title: 'Check Register', path: '/banking-cash/checks/check-register' },
          { title: 'Check Printing', path: '/banking-cash/checks/check-printing' },
          { title: 'Stop Payments', path: '/banking-cash/checks/stop-payments' },
        ],
      },
      {
        title: 'Cash Management',
        items: [
          { title: 'Cash Position', path: '/banking-cash/cash-management/cash-position' },
          { title: 'Short-Term Forecast', path: '/banking-cash/cash-management/short-term-forecast' },
          { title: 'Cash Flow Projection', path: '/banking-cash/cash-management/cash-flow-projection', isEnterprise: true },
        ],
      },
      {
        title: 'Treasury',
        isEnterprise: true,
        items: [
          { title: 'Intercompany Transfers', path: '/banking-cash/treasury/intercompany-transfers' },
          { title: 'Internal Loans', path: '/banking-cash/treasury/internal-loans' },
          { title: 'Credit Lines', path: '/banking-cash/treasury/credit-lines' },
          { title: 'Payment Approvals', path: '/banking-cash/treasury/payment-approvals' },
        ],
      },
    ],
  },
  {
    title: 'SALES',
    icon: DollarSign,
    items: [
      {
        title: 'Customers',
        items: [
          { title: 'Customers', path: '/sales/customers/customers' },
          { title: 'Customer Groups', path: '/sales/customers/customer-groups' },
          { title: 'Customer Documents', path: '/sales/customers/customer-documents' },
          { title: 'Price Lists', path: '/sales/customers/price-lists', isEnterprise: true },
          { title: 'Customer Portal', path: '/sales/customers/customer-portal' },
        ],
      },
      {
        title: 'Sales Operations',
        items: [
          { title: 'Products & Services', path: '/sales/sales-operations/products-services' },
          { title: 'Quotes & Estimates', path: '/sales/sales-operations/quotes-estimates' },
          { title: 'Sales Orders', path: '/sales/sales-operations/sales-orders' },
        ],
      },
      {
        title: 'Billing',
        items: [
          { title: 'Invoices', path: '/sales/billing/invoices' },
          { title: 'Recurring Invoices', path: '/sales/billing/recurring-invoices' },
          { title: 'Credit Notes', path: '/sales/billing/credit-notes' },
          { title: 'Payment Links', path: '/sales/billing/payment-links' },
          { title: 'Customer Statements', path: '/sales/billing/customer-statements' },
        ],
      },
      {
        title: 'Collections',
        items: [
          { title: 'Customer Payments', path: '/sales/collections/customer-payments' },
          { title: 'A/R Aging', path: '/sales/collections/ar-aging' },
          { title: 'A/R Aging with Collections Alerts', path: '/sales/collections/ar-aging-alerts' },
          { title: 'Write-Offs', path: '/sales/collections/write-offs' },
          { title: 'Collections Center', path: '/sales/collections/collections-center' },
          { title: 'Dunning Management', path: '/sales/collections/dunning-management', isEnterprise: true },
        ],
      },
      {
        title: 'Revenue Management',
        items: [
          { title: 'Revenue Recognition', path: '/sales/revenue-management/revenue-recognition' },
          { title: 'Deferred Revenue', path: '/sales/revenue-management/deferred-revenue' },
          { title: 'Contract Revenue', path: '/sales/revenue-management/contract-revenue', isEnterprise: true },
          { title: 'Subscription Billing', path: '/sales/revenue-management/subscription-billing', isEnterprise: true },
        ],
      },
      {
        title: 'Sales Insights',
        items: [
          { title: 'Sales Performance', path: '/sales/sales-insights/sales-performance' },
          { title: 'Revenue Trends', path: '/sales/sales-insights/revenue-trends' },
          { title: 'Customer Profitability', path: '/sales/sales-insights/customer-profitability' },
        ],
      },
    ],
  },
  {
    title: 'EXPENSES',
    icon: CreditCard,
    items: [
      {
        title: 'Vendors',
        items: [
          { title: 'Vendors', path: '/expenses/vendors/vendors' },
          { title: 'Vendor Documents', path: '/expenses/vendors/vendor-documents' },
          { title: 'Contractor Management', path: '/expenses/vendors/contractor-management' },
          { title: '1099 Management', path: '/expenses/vendors/1099-management' },
        ],
      },
      {
        title: 'Purchasing',
        items: [
          { title: 'Purchase Requests', path: '/expenses/purchasing/purchase-requests' },
          { title: 'Purchase Orders', path: '/expenses/purchasing/purchase-orders' },
          { title: 'Approval Workflows', path: '/expenses/purchasing/approval-workflows' },
          { title: 'Bill Approval Hierarchies', path: '/expenses/purchasing/bill-approval-hierarchies' },
          { title: 'Budget Checks', path: '/expenses/purchasing/budget-checks', isEnterprise: true },
        ],
      },
      {
        title: 'Expense Capture',
        items: [
          { title: 'Expenses', path: '/expenses/expense-capture/expenses' },
          { title: 'Receipts', path: '/expenses/expense-capture/receipts' },
          { title: 'Mileage', path: '/expenses/expense-capture/mileage' },
          { title: 'Employee Reimbursements', path: '/expenses/expense-capture/employee-reimbursements' },
          { title: 'Company Card Activity', path: '/expenses/expense-capture/company-card-activity' },
        ],
      },
      {
        title: 'Payables',
        items: [
          { title: 'Bills', path: '/expenses/payables/bills' },
          { title: 'Recurring Bills', path: '/expenses/payables/recurring-bills' },
          { title: 'Bill Payments', path: '/expenses/payables/bill-payments' },
          { title: 'A/P Aging', path: '/expenses/payables/ap-aging' },
          { title: 'Payment Runs', path: '/expenses/payables/payment-runs' },
        ],
      },
      {
        title: 'Expense Insights',
        items: [
          { title: 'Spend Analysis', path: '/expenses/expense-insights/spend-analysis' },
          { title: 'Vendor Spend', path: '/expenses/expense-insights/vendor-spend' },
          { title: 'Cost Allocation', path: '/expenses/expense-insights/cost-allocation' },
        ],
      },
    ],
  },
  {
    title: 'INVENTORY',
    icon: Package,
    items: [
      {
        title: 'Setup',
        items: [
          { title: 'Inventory Items', path: '/inventory/setup/inventory-items' },
          { title: 'Categories', path: '/inventory/setup/categories' },
          { title: 'Units of Measure', path: '/inventory/setup/units-of-measure' },
          { title: 'Bundles / Assemblies', path: '/inventory/setup/bundles-assemblies', isEnterprise: true },
        ],
      },
      {
        title: 'Receiving',
        items: [
          { title: 'Purchase Orders', path: '/inventory/receiving/purchase-orders' },
          { title: 'Item Receipts', path: '/inventory/receiving/item-receipts' },
          { title: 'Vendor Returns', path: '/inventory/receiving/vendor-returns' },
          { title: 'Landed Costs', path: '/inventory/receiving/landed-costs', isEnterprise: true },
        ],
      },
      {
        title: 'Stock Operations',
        items: [
          { title: 'Stock Movements', path: '/inventory/stock-operations/stock-movements' },
          { title: 'Inventory Adjustments', path: '/inventory/stock-operations/inventory-adjustments' },
          { title: 'Cycle Counts', path: '/inventory/stock-operations/cycle-counts' },
          { title: 'Physical Counts', path: '/inventory/stock-operations/physical-counts' },
          { title: 'Transfers', path: '/inventory/stock-operations/transfers', isEnterprise: true },
        ],
      },
      {
        title: 'Warehousing',
        isEnterprise: true,
        items: [
          { title: 'Warehouses', path: '/inventory/warehousing/warehouses' },
          { title: 'Bin Locations', path: '/inventory/warehousing/bin-locations' },
          { title: 'Stock Zones', path: '/inventory/warehousing/stock-zones' },
        ],
      },
      {
        title: 'Control',
        items: [
          { title: 'Reorder Points', path: '/inventory/control/reorder-points' },
          { title: 'Safety Stock', path: '/inventory/control/safety-stock' },
          { title: 'Backorders', path: '/inventory/control/backorders' },
          { title: 'Lot / Serial Tracking', path: '/inventory/control/lot-serial-tracking', isEnterprise: true },
        ],
      },
      {
        title: 'Valuation',
        items: [
          { title: 'Inventory Valuation', path: '/inventory/valuation/inventory-valuation' },
          { title: 'Cost Adjustments', path: '/inventory/valuation/cost-adjustments' },
          { title: 'Write-Downs', path: '/inventory/valuation/write-downs' },
          { title: 'COGS Analysis', path: '/inventory/valuation/cogs-analysis' },
        ],
      },
      {
        title: 'Inventory Insights',
        items: [
          { title: 'Stock Aging', path: '/inventory/inventory-insights/stock-aging' },
          { title: 'Turnover', path: '/inventory/inventory-insights/turnover' },
          { title: 'Overstock Analysis', path: '/inventory/inventory-insights/overstock-analysis' },
        ],
      },
    ],
  },
  {
    title: 'PROJECTS',
    icon: FolderKanban,
    items: [
      {
        title: 'Project Setup',
        items: [
          { title: 'Projects', path: '/projects/project-setup/projects' },
          { title: 'Project Templates', path: '/projects/project-setup/project-templates' },
          { title: 'Milestones', path: '/projects/project-setup/milestones' },
          { title: 'Budgets', path: '/projects/project-setup/budgets' },
          { title: 'Contracts', path: '/projects/project-setup/contracts' },
        ],
      },
      {
        title: 'Planning',
        items: [
          { title: 'Project Tasks', path: '/projects/planning/project-tasks' },
          { title: 'Schedule', path: '/projects/planning/schedule' },
          { title: 'Resource Planning', path: '/projects/planning/resource-planning', isEnterprise: true },
          { title: 'Capacity Planning', path: '/projects/planning/capacity-planning', isEnterprise: true },
        ],
      },
      {
        title: 'Tracking',
        items: [
          { title: 'Project Time', path: '/projects/tracking/project-time' },
          { title: 'Project Expenses', path: '/projects/tracking/project-expenses' },
          { title: 'Materials Usage', path: '/projects/tracking/materials-usage' },
          { title: 'Subcontractor Costs', path: '/projects/tracking/subcontractor-costs' },
          { title: 'Billable Review', path: '/projects/tracking/billable-review' },
        ],
      },
      {
        title: 'Billing',
        items: [
          { title: 'Project Billing', path: '/projects/billing/project-billing' },
          { title: 'Progress Billing', path: '/projects/billing/progress-billing' },
          { title: 'Milestone Billing', path: '/projects/billing/milestone-billing' },
          { title: 'Change Orders', path: '/projects/billing/change-orders' },
          { title: 'Retainers', path: '/projects/billing/retainers' },
          { title: 'Work in Progress (WIP)', path: '/projects/billing/work-in-progress' },
        ],
      },
      {
        title: 'Financials',
        items: [
          { title: 'Project Profitability', path: '/projects/financials/project-profitability' },
          { title: 'Budget vs Actual', path: '/projects/financials/budget-vs-actual' },
          { title: 'Margin Analysis', path: '/projects/financials/margin-analysis' },
          { title: 'Cost Breakdown', path: '/projects/financials/cost-breakdown' },
        ],
      },
      {
        title: 'Insights',
        items: [
          { title: 'Project Dashboard', path: '/projects/insights/project-dashboard' },
          { title: 'Resource Utilization', path: '/projects/insights/resource-utilization' },
          { title: 'Completion Forecast', path: '/projects/insights/completion-forecast' },
        ],
      },
    ],
  },
  {
    title: 'TIME',
    icon: Clock,
    items: [
      {
        title: 'Entry',
        items: [
          { title: 'Time Entries', path: '/time/entry/time-entries' },
          { title: 'Timesheets', path: '/time/entry/timesheets' },
          { title: 'Timer', path: '/time/entry/timer' },
        ],
      },
      {
        title: 'Review',
        items: [
          { title: 'Billable Time Review', path: '/time/review/billable-time-review' },
          { title: 'Time Approvals', path: '/time/review/time-approvals', isEnterprise: true },
        ],
      },
      {
        title: 'Analysis',
        items: [
          { title: 'Time by Project', path: '/time/analysis/time-by-project' },
          { title: 'Time by Customer', path: '/time/analysis/time-by-customer' },
          { title: 'Utilization Report', path: '/time/analysis/utilization-report' },
        ],
      },
    ],
  },
  {
    title: 'PAYROLL & WORKFORCE',
    label: 'PAYROLL',
    icon: Users,
    items: [
      {
        title: 'Workforce',
        items: [
          { title: 'Employees', path: '/payroll-workforce/workforce/employees' },
          { title: 'Employment Contracts', path: '/payroll-workforce/workforce/employment-contracts' },
          { title: 'Job Positions', path: '/payroll-workforce/workforce/job-positions' },
          { title: 'Employee Documents', path: '/payroll-workforce/workforce/employee-documents' },
          { title: 'Contractor Management', path: '/payroll-workforce/workforce/contractor-management' },
          { title: 'Recruiting', path: '/payroll-workforce/workforce/recruiting', isEnterprise: true },
        ],
      },
      {
        title: 'Time & Leave',
        items: [
          { title: 'Leave Requests', path: '/payroll-workforce/time-leave/leave-requests' },
          { title: 'Leave Balances', path: '/payroll-workforce/time-leave/leave-balances' },
          { title: 'Holiday Calendar', path: '/payroll-workforce/time-leave/holiday-calendar' },
          { title: 'Overtime Rules', path: '/payroll-workforce/time-leave/overtime-rules' },
          { title: 'Shift Scheduling', path: '/payroll-workforce/time-leave/shift-scheduling', isEnterprise: true },
        ],
      },
      {
        title: 'Payroll Processing',
        items: [
          { title: 'Payroll Runs', path: '/payroll-workforce/payroll-processing/payroll-runs' },
          { title: 'Off-Cycle Payroll', path: '/payroll-workforce/payroll-processing/off-cycle-payroll' },
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
          { title: 'Benefit Plans', path: '/payroll-workforce/compensation/benefit-plans', isEnterprise: true },
        ],
      },
      {
        title: 'Payroll Taxes & Statutory',
        items: [
          { title: 'Tax Withholding', path: '/payroll-workforce/payroll-taxes/tax-withholding' },
          { title: 'Government Contributions', path: '/payroll-workforce/payroll-taxes/government-contributions' },
          { title: 'Remittance Tracking', path: '/payroll-workforce/payroll-taxes/remittance-tracking' },
          { title: 'Payroll Reports', path: '/payroll-workforce/payroll-taxes/payroll-reports' },
        ],
      },
    ],
  },
  {
    title: 'TAXES',
    icon: Receipt,
    items: [
      {
        title: 'Tax Center',
        items: [
          { title: 'Tax Dashboard', path: '/taxes/tax-center/tax-dashboard' },
          { title: 'Tax Liabilities', path: '/taxes/tax-center/tax-liabilities' },
          { title: 'Filing & Payments', path: '/taxes/tax-center/filing-payments' },
          { title: 'Tax Calendar', path: '/taxes/tax-center/tax-calendar' },
        ],
      },
      {
        title: 'Tax Setup',
        items: [
          { title: 'Tax Agencies', path: '/taxes/tax-setup/tax-agencies' },
          { title: 'Tax Types', path: '/taxes/tax-setup/tax-types' },
          { title: 'Tax Rates', path: '/taxes/tax-setup/tax-rates' },
          { title: 'Tax Codes', path: '/taxes/tax-setup/tax-codes' },
          { title: 'Jurisdictions', path: '/taxes/tax-setup/jurisdictions', isEnterprise: true },
          { title: 'Withholding Setup', path: '/taxes/tax-setup/withholding-setup' },
          { title: 'Exemptions & Rules', path: '/taxes/tax-setup/exemptions-rules' },
        ],
      },
      {
        title: 'Tax Studio',
        isEnterprise: true,
        items: [
          { title: 'Country Templates', path: '/taxes/tax-studio/country-templates' },
          { title: 'Rule Engine', path: '/taxes/tax-studio/rule-engine' },
          { title: 'Tax Profiles', path: '/taxes/tax-studio/tax-profiles' },
          { title: 'Advanced Configuration', path: '/taxes/tax-studio/advanced-configuration' },
        ],
      },
      {
        title: 'Sales & Output Tax',
        countries: ['PH'],
        items: [
          { title: 'VAT / Sales Tax', path: '/taxes/sales-output-tax/vat-sales-tax' },
          { title: 'Zero-Rated & Exempt Sales', path: '/taxes/sales-output-tax/zero-rated-exempt' },
          { title: 'Output Tax Ledger', path: '/taxes/sales-output-tax/output-tax-ledger' },
        ],
      },
      {
        title: 'Purchase & Input Tax',
        countries: ['PH'],
        items: [
          { title: 'Input VAT', path: '/taxes/purchase-input-tax/input-vat' },
          { title: 'Expanded Withholding', path: '/taxes/purchase-input-tax/expanded-withholding' },
          { title: 'Creditable Withholding', path: '/taxes/purchase-input-tax/creditable-withholding' },
          { title: 'Tax Reconciliation', path: '/taxes/purchase-input-tax/tax-reconciliation' },
        ],
      },
      {
        title: 'Tax Reporting',
        countries: ['PH'],
        items: [
          { title: 'Tax Summary', path: '/taxes/tax-reporting/tax-summary' },
          { title: 'VAT Payable', path: '/taxes/tax-reporting/vat-payable' },
          { title: 'Withholding Report', path: '/taxes/tax-reporting/withholding-report' },
          { title: 'Tax Liability Report', path: '/taxes/tax-reporting/tax-liability-report' },
          { title: 'Audit Trail by Tax Code', path: '/taxes/tax-reporting/audit-trail-tax-code' },
        ],
      },
      {
        title: 'Filing & Payments',
        countries: ['PH'],
        items: [
          { title: 'Tax Returns', path: '/taxes/filing-payments/tax-returns' },
          { title: 'Filing History', path: '/taxes/filing-payments/filing-history' },
          { title: 'Tax Payments', path: '/taxes/filing-payments/tax-payments' },
          { title: 'Remittance Tracking', path: '/taxes/filing-payments/remittance-tracking' },
          { title: 'E-Filing', path: '/taxes/filing-payments/e-filing', isEnterprise: true },
        ],
      },
      {
        title: 'Corporate Tax',
        countries: ['PH'],
        isEnterprise: true,
        items: [
          { title: 'Income Tax', path: '/taxes/corporate-tax/income-tax' },
          { title: 'Deferred Tax', path: '/taxes/corporate-tax/deferred-tax' },
          { title: 'Transfer Pricing', path: '/taxes/corporate-tax/transfer-pricing' },
          { title: 'Multi-Jurisdiction Tax', path: '/taxes/corporate-tax/multi-jurisdiction-tax' },
          { title: 'Tax Risk & Optimization', path: '/taxes/corporate-tax/tax-risk-optimization' },
        ],
      },
      {
        title: 'Year-End',
        countries: ['PH'],
        items: [
          { title: 'Annual Tax Summary', path: '/taxes/year-end/annual-tax-summary' },
          { title: 'Tax Adjustments', path: '/taxes/year-end/tax-adjustments' },
          { title: 'Tax Closing Entries', path: '/taxes/year-end/tax-closing-entries' },
        ],
      },
      {
        title: 'US Tax (coming soon)',
        countries: ['US'],
        items: [
          { title: 'Sales Tax Setup', path: '/taxes/us-sales-tax/setup' },
          { title: '1099 Reporting', path: '/taxes/us-year-end/1099' },
          { title: 'W-2 / Payroll Reporting', path: '/taxes/us-year-end/w2' },
          { title: 'Federal Returns', path: '/taxes/us-federal-returns' },
          { title: 'State & Local Returns', path: '/taxes/us-state-returns' },
        ],
      },
      {
        title: 'Philippine Tax',
        label: 'PH TAX',
        countries: ['PH'],
        items: [
          {
            title: 'BIR Forms',
            items: [
              { title: 'Form 2550Q (Quarterly VAT)', path: '/philippine-tax/bir-forms/form-2550q' },
              { title: 'Form 2550M (Monthly VAT)', path: '/philippine-tax/bir-forms/form-2550m' },
              { title: 'Form 2307 (Creditable Tax)', path: '/philippine-tax/bir-forms/form-2307' },
              { title: 'Form 2316 (Compensation)', path: '/philippine-tax/bir-forms/form-2316' },
              { title: 'Form 1601CQ (Qtrly Remittance)', path: '/philippine-tax/bir-forms/form-1601cq' },
              { title: 'Form 1604CF (Alphalist Annual)', path: '/philippine-tax/bir-forms/form-1604cf' },
            ],
          },
          {
            title: 'Withholding Tax',
            items: [
              { title: 'EWT 1% — General', path: '/philippine-tax/withholding/ewt-1' },
              { title: 'EWT 2% — Goods/Services', path: '/philippine-tax/withholding/ewt-2' },
              { title: 'EWT 5% — Officers', path: '/philippine-tax/withholding/ewt-5' },
              { title: 'EWT 10% — Lease/Rental', path: '/philippine-tax/withholding/ewt-10' },
              { title: 'Final Tax 1% — Gross Sales', path: '/philippine-tax/withholding/final-1' },
              { title: 'Final Tax 5% — Capital Gains', path: '/philippine-tax/withholding/final-5' },
            ],
          },
          {
            title: 'VAT Management',
            items: [
              { title: 'VAT Registration', path: '/philippine-tax/vat/vat-registration' },
              { title: 'VAT Ledger', path: '/philippine-tax/vat/vat-ledger' },
              { title: 'VAT Transactions', path: '/philippine-tax/vat/vat-transactions' },
              { title: 'VAT Returns', path: '/philippine-tax/vat/vat-returns' },
              { title: '3% Percentage Tax', path: '/philippine-tax/vat/percentage-tax' },
            ],
          },
          {
            title: 'Payroll Taxes (PH)',
            items: [
              { title: 'SSS Contributions', path: '/philippine-tax/payroll-taxes/sss' },
              { title: 'PhilHealth Contributions', path: '/philippine-tax/payroll-taxes/philhealth' },
              { title: 'Pag-IBIG Contributions', path: '/philippine-tax/payroll-taxes/pag-ibig' },
              { title: 'Withholding Tax on Comp.', path: '/philippine-tax/payroll-taxes/withholding' },
              { title: '13th Month Pay', path: '/philippine-tax/payroll-taxes/13th-month-pay' },
            ],
          },
          {
            title: 'Local Taxes',
            items: [
              { title: "Mayor's Permit", path: '/philippine-tax/local-taxes/mayors-permit' },
              { title: 'Barangay Clearance', path: '/philippine-tax/local-taxes/barangay-clearance' },
              { title: 'Real Property Tax', path: '/philippine-tax/local-taxes/real-property-tax' },
              { title: 'Community Tax Certificate', path: '/philippine-tax/local-taxes/community-tax' },
              { title: 'Business Tax', path: '/philippine-tax/local-taxes/business-tax' },
            ],
          },
          {
            title: 'Tax Calendar',
            items: [
              { title: 'Filing Deadlines', path: '/philippine-tax/tax-calendar/filing-deadlines' },
              { title: 'Compliance Alerts', path: '/philippine-tax/tax-calendar/compliance-alerts' },
              { title: 'Tax Obligations', path: '/philippine-tax/tax-calendar/tax-obligations' },
            ],
          },
        ],
      },
    ],
  },
  {
    title: 'REPORTING',
    icon: BarChart3,
    items: [
      { title: 'Financial Statements', path: '/reporting/financial-statements' },
      { title: 'Standard Reports', path: '/reporting/standard-reports' },
      { title: 'Custom Reports', path: '/reporting/custom-reports' },
      { title: 'Saved Views', path: '/reporting/saved-views' },
      { title: 'Performance Center', path: '/reporting/performance-center' },
      { title: 'ESG Reporting', path: '/reporting/esg-reporting', isEnterprise: true },
    ],
  },
  {
    title: 'COMPLIANCE',
    icon: ShieldCheck,
    isEnterprise: true,
    items: [
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
          { title: 'Fraud Detection Rules', path: '/compliance/monitoring/fraud-detection-rules' },
          { title: 'Audit Log Analysis', path: '/compliance/monitoring/audit-log-analysis' },
        ],
      },
      {
        title: 'Reporting',
        items: [
          { title: 'SOX Compliance', path: '/compliance/reporting/sox-compliance' },
          { title: 'Compliance Reports', path: '/compliance/reporting/compliance-reports' },
          { title: 'Attestations', path: '/compliance/reporting/attestations' },
        ],
      },
    ],
  },
  {
    title: 'AUTOMATION',
    icon: Zap,
    items: [
      {
        title: 'Workflow Engine',
        items: [
          { title: 'Workflow Builder', path: '/automation/workflow-engine/workflow-builder' },
          { title: 'Smart Rules', path: '/automation/workflow-engine/smart-rules' },
          { title: 'Email Notifications', path: '/automation/workflow-engine/email-notifications' },
        ],
      },
      {
        title: 'Approvals & Governance',
        items: [
          { title: 'Approval Matrices', path: '/automation/approvals-governance/approval-matrices' },
          { title: 'Approval Chains', path: '/automation/approvals-governance/approval-chains' },
          { title: 'Delegation Rules', path: '/automation/approvals-governance/delegation-rules' },
        ],
      },
      {
        title: 'AI & Intelligence',
        items: [
          { title: 'AI Bookkeeping', path: '/automation/ai-intelligence/ai-bookkeeping' },
          { title: 'Smart Matching', path: '/automation/ai-intelligence/smart-matching' },
          { title: 'Document Recognition', path: '/automation/ai-intelligence/document-recognition' },
        ],
      },
      {
        title: 'Scheduling',
        items: [
          { title: 'Scheduled Reports', path: '/automation/scheduling/scheduled-reports' },
          { title: 'Batch Processing', path: '/automation/scheduling/batch-processing' },
          { title: 'Recurring Templates Hub', path: '/automation/scheduling/recurring-templates-hub' },
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
    title: 'ACCOUNTANT',
    icon: UserCog,
    items: [
      { title: 'Books Review', path: '/accountant-workspace/books-review' },
      { title: 'Reconciliation Hub', path: '/accountant-workspace/reconciliation-hub' },
      { title: 'Adjusting Entries', path: '/accountant-workspace/adjusting-entries' },
      { title: 'Client Requests', path: '/accountant-workspace/client-requests' },
      { title: 'My Accountant', path: '/accountant-workspace/my-accountant' },
      { title: 'Live Experts', path: '/accountant-workspace/live-experts' },
    ],
  },
  {
    title: 'APPS',
    icon: Plug,
    items: [
      {
        title: 'Discover',
        items: [
          { title: 'App Marketplace', path: '/apps-integrations/discover/app-marketplace' },
          { title: 'Featured Apps', path: '/apps-integrations/discover/featured-apps' },
          { title: 'Suggested Integrations', path: '/apps-integrations/discover/suggested-integrations' },
        ],
      },
      {
        title: 'My Integrations',
        items: [
          { title: 'Connected Apps', path: '/apps-integrations/my-integrations/connected-apps' },
          { title: 'Connection Health', path: '/apps-integrations/my-integrations/connection-health' },
          { title: 'Integration Logs', path: '/apps-integrations/my-integrations/integration-logs' },
        ],
      },
      {
        title: 'Developer Tools',
        isEnterprise: true,
        items: [
          { title: 'API Keys', path: '/apps-integrations/developer-tools/api-keys' },
          { title: 'Webhooks', path: '/apps-integrations/developer-tools/webhooks' },
          { title: 'Developer Sandbox', path: '/apps-integrations/developer-tools/developer-sandbox' },
          { title: 'API Documentation', path: '/apps-integrations/developer-tools/api-documentation' },
        ],
      },
      {
        title: 'Data Tools',
        items: [
          { title: 'Import Data', path: '/apps-integrations/data-tools/import-data' },
          { title: 'Export Data', path: '/apps-integrations/data-tools/export-data' },
          { title: 'Import History', path: '/apps-integrations/data-tools/import-history' },
          { title: 'Data Sync Status', path: '/apps-integrations/data-tools/data-sync-status' },
        ],
      },
    ],
  },
  {
    title: 'AI & ANALYTICS',
    label: 'AI',
    icon: Brain,
    items: [
      {
        title: 'Insights',
        items: [
          { title: 'Insights Dashboard', path: '/ai-analytics/insights/insights-dashboard' },
          { title: 'Cash Flow Alerts', path: '/ai-analytics/insights/cash-flow-alerts' },
          { title: 'Tax Optimization', path: '/ai-analytics/insights/tax-optimization' },
          { title: 'Anomaly Detection', path: '/ai-analytics/insights/anomaly-detection' },
        ],
      },
      {
        title: 'Predictions',
        items: [
          { title: 'Revenue Forecast', path: '/ai-analytics/predictions/revenue-forecast' },
          { title: 'Cash Flow Forecast', path: '/ai-analytics/predictions/cash-flow-forecast' },
          { title: 'Expense Predictions', path: '/ai-analytics/predictions/expense-predictions' },
          { title: 'Payment Predictions', path: '/ai-analytics/predictions/payment-predictions' },
        ],
      },
      {
        title: 'AI Agents',
        items: [
          { title: 'Tax Optimizer Agent', path: '/ai-analytics/agents/tax-optimizer' },
          { title: 'Cash Flow Manager', path: '/ai-analytics/agents/cash-flow-manager' },
          { title: 'Fraud Detector', path: '/ai-analytics/agents/fraud-detector' },
          { title: 'Collections Agent', path: '/ai-analytics/agents/collections-agent' },
        ],
      },
      {
        title: 'Chat Assistant',
        items: [
          { title: 'AI Chat', path: '/ai-analytics/chat/ai-chat' },
          { title: 'Query History', path: '/ai-analytics/chat/query-history' },
        ],
      },
      {
        title: 'Governance',
        items: [
          { title: 'AI Rules', path: '/ai-analytics/governance/ai-rules' },
          { title: 'AI Audit Logs', path: '/ai-analytics/governance/audit-logs' },
          { title: 'Model Performance', path: '/ai-analytics/governance/model-performance' },
        ],
      },
    ],
  },
  {
    title: 'SETTINGS',
    icon: Settings,
    items: [
      {
        title: 'Account & Billing',
        items: [
          { title: 'Subscription & Plans', path: '/settings/account-billing/subscription-plans' },
          { title: 'Billing History', path: '/settings/account-billing/billing-history' },
          { title: 'Payment Methods', path: '/settings/account-billing/payment-methods' },
        ],
      },
      {
        title: 'Company Profile',
        items: [
          { title: 'Company Details', path: '/settings/company-profile/company-details' },
          { title: 'Fiscal Year Setup', path: '/settings/company-profile/fiscal-year-setup' },
          { title: 'Operating Hours', path: '/settings/company-profile/operating-hours' },
        ],
      },
      {
        title: 'Entity Management',
        isEnterprise: true,
        items: [
          { title: 'Entity Defaults', path: '/settings/entity-management/entity-defaults' },
          { title: 'Base Currency', path: '/settings/entity-management/base-currency' },
          { title: 'Numbering Sequences', path: '/settings/entity-management/numbering-sequences' },
        ],
      },
      {
        title: 'Users & Security',
        items: [
          { title: 'User Management', path: '/settings/users-security/user-management' },
          { title: 'Roles & Permissions', path: '/settings/users-security/roles-permissions' },
          { title: 'Teams & Groups', path: '/settings/users-security/teams-groups' },
          { title: 'Login History', path: '/settings/users-security/login-history' },
          { title: 'Two-Factor Auth (2FA)', path: '/settings/users-security/two-factor-auth' },
        ],
      },
      {
        title: 'Accounting Preferences',
        items: [
          { title: 'Default Accounts', path: '/settings/accounting-preferences/default-accounts' },
          { title: 'Closing Date Protection', path: '/settings/accounting-preferences/closing-date-protection' },
          { title: 'Currency Settings', path: '/settings/accounting-preferences/currency-settings' },
        ],
      },
      {
        title: 'Customization',
        items: [
          { title: 'Custom Fields', path: '/settings/customization/custom-fields' },
          { title: 'Custom Lists', path: '/settings/customization/custom-lists' },
          { title: 'Transaction Tags', path: '/settings/customization/transaction-tags' },
          { title: 'PDF Templates', path: '/settings/customization/pdf-templates' },
        ],
      },
      {
        title: 'Notifications',
        items: [
          { title: 'System Alerts', path: '/settings/notifications/system-alerts' },
          { title: 'Email Digest Settings', path: '/settings/notifications/email-digest-settings' },
        ],
      },
      {
        title: 'Data & Privacy',
        items: [
          { title: 'Audit Log', path: '/settings/data-privacy/audit-log' },
          { title: 'Data Export', path: '/settings/data-privacy/data-export' },
          { title: 'Data Backup', path: '/settings/data-privacy/data-backup' },
          { title: 'Trash / Deleted Records', path: '/settings/data-privacy/trash-deleted-records' },
        ],
      },
    ],
  },
]

// Back-compat alias
export const ownerNav = navigationData
