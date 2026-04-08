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
    icon: BarChart3,
    // ── Simplified: 6 flat section links (tab details handled by TabbedSectionLayout) ──
    items: [
      { title: 'Cash & Banking',           path: '/operations/cash-banking/transactions/bank-transactions' },
      { title: 'Sales (Order-to-Cash)',     path: '/operations/sales/customers/customers' },
      { title: 'Expenses (Procure-to-Pay)', path: '/operations/expenses/purchasing/vendors' },
      { title: 'Inventory',                 path: '/inventory/setup/inventory-items' },
      { title: 'Projects',                  path: '/projects/project-setup/projects' },
      { title: 'Time',                      path: '/time/entry/time-entries' },
    ],
    // ── OLD groups config (preserved for reference during migration) ──────────────────
    // groups: [
  },
  {
    title: 'ACCOUNTING',
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
          { title: 'Adjusting Entries', path: '/accounting/core-accounting/adjusting-entries' },
          { title: 'Recurring Journals', path: '/accounting/core-accounting/recurring-journals' },
        ],
      },
      {
        title: 'Period Close',
        items: [
          { title: 'Close Workflow', path: '/accounting/period-close/close-workflow' },
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
      {
        title: 'Budgeting',
        items: [
          { title: 'Budgets', path: '/accounting/budgeting/budgets' },
          { title: 'Budget vs Actual', path: '/accounting/budgeting/budget-vs-actual' },
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
          { title: 'Contractors', path: '/payroll-workforce/workforce/contractors' },
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
    icon: Receipt,
    groups: [
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
          { title: 'Tax Rates & Codes', path: '/taxes/tax-setup/tax-rates' },
          { title: 'Country Packs', path: '/taxes/tax-setup/country-packs' },
          { title: 'Rule Engine', path: '/taxes/tax-setup/rule-engine' },
        ],
      },
      {
        title: 'Reporting & Filing',
        items: [
          { title: 'Tax Summary', path: '/taxes/tax-reporting/tax-summary' },
          { title: 'VAT Payable', path: '/taxes/tax-reporting/vat-payable' },
          { title: 'Withholding Tax', path: '/taxes/tax-reporting/withholding-tax' },
          { title: 'Tax Returns', path: '/taxes/filing-payments/tax-returns' },
          { title: 'E-Filing', path: '/taxes/filing-payments/e-filing' },
        ],
      },
    ],
  },
  {
    title: 'REPORTING',
    icon: BarChart3,
    groups: [
      {
        title: 'Financial Statements',
        items: [
          { title: 'Balance Sheet', path: '/reporting/reports-center/financial-statements/balance-sheet' },
          { title: 'Profit & Loss', path: '/reporting/reports-center/financial-statements/profit-and-loss' },
          { title: 'Cash Flow Statement', path: '/reporting/reports-center/financial-statements/cash-flow-statement' },
          { title: 'Statement of Changes in Equity', path: '/reporting/reports-center/financial-statements/statement-of-changes' },
        ],
      },
      {
        title: 'Accountant Reports',
        items: [
          { title: 'Trial Balance', path: '/reporting/reports-center/accountant-reports/trial-balance' },
          { title: 'General Ledger', path: '/reporting/reports-center/accountant-reports/general-ledger' },
          { title: 'Journal Report', path: '/reporting/reports-center/accountant-reports/journal-report' },
          { title: 'Audit Trail', path: '/reporting/reports-center/accountant-reports/audit-trail' },
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
          { title: 'Executive Dashboard', path: '/reporting/analytics/analytics-dashboards' },
          { title: 'KPI Dashboard', path: '/reporting/analytics/analytics-dashboards' },
          { title: 'Revenue Trends', path: '/reporting/analytics/revenue-trends' },
          { title: 'Cash Position', path: '/reporting/analytics/cash-position' },
          { title: 'Performance Analytics', path: '/reporting/analytics/performance-analytics' },
        ],
      },
      {
        title: 'Custom Reports',
        items: [
          { title: 'Report Builder', path: '/reporting/custom-reports/report-builder' },
          { title: 'Saved Reports', path: '/reporting/custom-reports/scheduled-reports' },
          { title: 'Report Templates', path: '/reporting/custom-reports/report-templates' },
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
          { title: 'Notifications', path: '/tasks-approvals/my-work/notifications' },
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
    icon: ShieldCheck,
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
          { title: 'Fraud Detection', path: '/compliance/monitoring/fraud-detection' },
          { title: 'Audit Log', path: '/compliance/monitoring/audit-log-analysis' },
        ],
      },
    ],
  },
  {
    title: 'COLLABORATION',
    icon: UserCog,
    groups: [
      {
        title: 'Review',
        items: [
          { title: 'Books Review', path: '/compliance/reporting/books-review' },
          { title: 'Work Papers', path: '/compliance/reporting/work-papers' },
          { title: 'Shared Reports', path: '/compliance/reporting/shared-reports' },
          { title: 'Review Comments', path: '/compliance/reporting/review-comments' },
        ],
      },
      {
        title: 'Communication',
        items: [
          { title: 'Chat', path: '/accountant-workspace/chat' },
          { title: 'Shared Notes', path: '/accountant-workspace/shared-notes' },
          { title: 'Client Requests', path: '/accountant-workspace/client-requests' },
        ],
      },
    ],
  },
  {
    title: 'AUTOMATION',
    icon: Zap,
    groups: [
      {
        title: 'Workflow Engine',
        items: [
          { title: 'Workflow Builder', path: '/automation/workflow-engine/workflow-builder' },
          { title: 'Smart Rules', path: '/automation/workflow-engine/smart-rules' },
          { title: 'Approval Chains', path: '/automation/workflow-engine/approval-chains' },
        ],
      },
      {
        title: 'AI & Intelligence',
        items: [
          { title: 'AI Bookkeeping', path: '/automation/ai-intelligence/ai-bookkeeping' },
          { title: 'Smart Matching', path: '/automation/ai-intelligence/smart-matching' },
          { title: 'Anomaly Detection', path: '/automation/ai-intelligence/anomaly-detection' },
          { title: 'Predictions', path: '/automation/ai-intelligence/predictions' },
        ],
      },
      {
        title: 'Monitoring',
        items: [
          { title: 'Automation Logs', path: '/automation/monitoring/automation-logs' },
          { title: 'Error Queue', path: '/automation/monitoring/error-queue' },
          { title: 'Scheduled Jobs', path: '/automation/monitoring/scheduled-jobs' },
        ],
      },
    ],
  },
  {
    title: 'APPS',
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
    icon: Settings,
    groups: [
      {
        title: 'Company Profile',
        items: [
          { title: 'Company Details', path: '/settings/company-profile/company-details' },
          { title: 'Fiscal Year Setup', path: '/settings/company-profile/fiscal-year-setup' },
          { title: 'Base Currency', path: '/settings/company-profile/base-currency' },
        ],
      },
      {
        title: 'Company Structure',
        items: [
          { title: 'Legal Entities', path: '/organization/entity-structure/legal-entities' },
          { title: 'Intercompany Transactions', path: '/organization/entity-structure/intercompany' },
          { title: 'Consolidation', path: '/organization/entity-structure/consolidation' },
          { title: 'Filing Calendar', path: '/organization/governance/filing-calendar' },
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
          { title: 'Audit Log', path: '/settings/data-privacy/audit-log' },
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