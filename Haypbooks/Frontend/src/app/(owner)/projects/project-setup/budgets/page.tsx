'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Budgets'
      module='PROJECTS'
      breadcrumb='Projects / Project Setup / Budgets'
      purpose='Establishes and manages detailed project budgets broken down by cost category, phase, and resource. Provides the financial baseline against which actual costs are tracked and variance is measured throughout the project lifecycle.'
      components={[
        { name: 'Budget Builder Grid', description: 'Spreadsheet-style entry for budget lines by category, phase, and time period' },
        { name: 'Labor Budget Calculator', description: 'Calculates labor budget from role rates, estimated hours, and duration' },
        { name: 'Budget Version Control', description: 'Manages original, revised, and approved budget versions with change history' },
        { name: 'Budget Approval Workflow', description: 'Routes budget through PM, finance, and executive approval before activation' },
        { name: 'Budget Contingency Settings', description: 'Configure contingency reserve percentage and management reserve' },
      ]}
      tabs={['Budget Summary', 'Budget Detail', 'Labor Budget', 'Version History']}
      features={['Category-level budget line entry', 'Labor budget from rate cards and hours', 'Budget versioning and change tracking', 'Multi-level approval workflow', 'Contingency and management reserve', 'Budget vs. actual integration', 'Import budget from Excel template']}
      dataDisplayed={['Budget line items by category', 'Phase-level budget allocation', 'Total project budget', 'Labor budget by role', 'Non-labor budget by category', 'Contingency reserve amount', 'Budget version history']}
      userActions={['Create project budget', 'Enter budget by category and phase', 'Calculate labor budget from rate card', 'Submit budget for approval', 'Revise budget with version tracking', 'Export budget to Excel', 'View budget history']}
      relatedPages={[
        { label: 'Projects', href: '/projects/project-setup/projects' },
        { label: 'Budget vs. Actual', href: '/projects/financials/budget-vs-actual' },
        { label: 'Contracts', href: '/projects/project-setup/contracts' },
      ]}
    />
  )
}

