'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Standard Reports'
      module='REPORTING'
      breadcrumb='Reporting / Standard Reports'
      purpose='Library of pre-built standard reports covering all key accounting and business functions. Organized by category, these reports are ready to run with minimal configuration and serve as the everyday reporting toolkit for finance teams, business owners, and managers.'
      components={[
        { name: 'Report Library Browser', description: 'Searchable catalog of all standard reports organized by category and function' },
        { name: 'Quick-Run Panel', description: 'One-click report execution with default parameters for common reporting needs' },
        { name: 'Filter & Parameter Bar', description: 'Date range, entity, and filter controls available for each report' },
        { name: 'Favorites & Pinning', description: 'Pin frequently used reports for quick access from the library' },
        { name: 'Batch Report Scheduler', description: 'Schedule multiple standard reports to run and be emailed automatically' },
        { name: 'Report Preview Pane', description: 'In-app preview of report output before download or sharing' },
      ]}
      tabs={['All Reports', 'Financial', 'Sales', 'Expenses', 'Banking', 'Tax', 'Favorites']}
      features={['Over 50 pre-built standard reports', 'Category-based report browsing', 'One-click report execution', 'Favorite and pin frequently used reports', 'Scheduled batch report delivery via email', 'Multi-format export (PDF, Excel, CSV)', 'Parameter memory per user']}
      dataDisplayed={['Report name, category, and description', 'Last run date and user', 'Available filter parameters', 'Report format options', 'Scheduled delivery status', 'Usage frequency', 'Related reports suggestions']}
      userActions={['Browse and search report library', 'Run a standard report', 'Set report filters and parameters', 'Pin report to favorites', 'Schedule automated report delivery', 'Export report to PDF or Excel', 'Share report with team member']}
      relatedPages={[
        { label: 'Custom Reports', href: '/reporting/custom-reports' },
        { label: 'Reports Center', href: '/reporting/reports-center/financial-statements' },
        { label: 'Saved Views', href: '/reporting/saved-views' },
      ]}
    />
  )
}

