'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Report Builder"
      module="REPORTING"
      breadcrumb="Reporting / Custom Reports / Report Builder"
      purpose="The Report Builder is a drag-and-drop custom report creation tool that allows users to build any ad-hoc financial report not covered by the standard reports. Users choose the data source (GL accounts, transactions, AR, AP, inventory, payroll), select dimensions (by department, project, period, entity), choose measures (amounts, counts, averages), apply filters, and lay out the report in rows and columns. Custom reports can be saved, named, and added to the user's report favorites for future use. This eliminates the need to export to Excel for every non-standard analysis."
      components={[
        { name: 'Data Source Selector', description: 'Choose the primary data source for the report: GL Transactions, Accounts, AR/AP, Inventory, Payroll, Projects.' },
        { name: 'Column Builder', description: 'Drag fields to columns: date ranges, comparative periods, or custom column definitions.' },
        { name: 'Row Builder', description: 'Choose row groupings: by account, by department, by project, by customer/vendor, by period, by employee.' },
        { name: 'Filter Panel', description: 'Add filters: date range, account type, department, project, entity, budget vs. actual toggle.' },
        { name: 'Report Preview', description: 'Live-updating preview of the report as design changes are made.' },
        { name: 'Save and Name', description: 'Save the report with a name and description for future access in Custom Reports library.' },
      ]}
      tabs={['Build Report', 'My Reports', 'Shared Reports', 'Templates']}
      features={[
        'Flexible drag-and-drop report builder',
        'Multiple data sources support',
        'Custom dimensions, measures, and filters',
        'Multiple comparison period columns',
        'Save and name custom reports',
        'Share reports with team members',
        'Export to Excel, PDF, and CSV',
        'Report templates for common custom analyses',
      ]}
      dataDisplayed={[
        'Custom report output per user configuration',
        'Library of saved custom reports',
        'Shared reports from other team members',
        'Report templates available',
      ]}
      userActions={[
        'Build a new custom report from scratch',
        'Use a template as a starting point',
        'Save and name the report',
        'Share the report with a team member',
        'Export report to Excel or PDF',
        'Edit an existing saved report',
      ]}
      relatedPages={[
        { label: 'Scheduled Reports', href: '/reporting/custom-reports/scheduled-reports' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
        { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
        { label: 'Analytics Dashboards', href: '/reporting/analytics/analytics-dashboards' },
      ]}
    />
  )
}

