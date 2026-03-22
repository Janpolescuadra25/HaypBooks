'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxDashboardPage() {
  return (
    <PageDocumentation
      title="Tax Dashboard"
      module="TAXES"
      breadcrumb="Taxes / Tax Center / Tax Dashboard"
      purpose="Tax Dashboard is the executive summary view of the company's complete tax position — showing outstanding liabilities, upcoming deadlines, recent filings, and year-to-date tax expenses across all tax types in one consolidated screen. Finance managers and CFOs use this dashboard to stay informed of total tax exposure without navigating into individual tax modules. Drill-down links from each KPI card connect directly to the underlying detail."
      components={[
        { name: 'Tax Liability KPI Cards', description: 'Summary cards for total VAT payable, income tax payable, withholding payable, and total tax exposure.' },
        { name: 'Upcoming Deadlines Widget', description: 'Mini calendar widget showing the next 5 filing/payment obligations with days-to-due-date.' },
        { name: 'Recent Filing Activity Feed', description: 'Timeline feed of the last 10 filings and payments with status and amount.' },
        { name: 'YTD Tax Expense Chart', description: 'Bar chart showing cumulative tax expense by type month-by-month for the current fiscal year.' },
        { name: 'Navigation Shortcuts Panel', description: 'Quick-access tiles for Tax Returns, Payments, Calendar, and Reports modules.' },
      ]}
      tabs={['Overview', 'Liabilities', 'Recent Activity', 'YTD Analysis']}
      features={[
        'Single-screen executive view of total tax position',
        'KPI cards for each major tax type liability',
        'Upcoming deadlines widget with days-to-due countdown',
        'Recent filing and payment activity feed',
        'Year-to-date tax expense comparison by type',
        'Quick-access navigation to all key tax sub-modules',
      ]}
      dataDisplayed={[
        'Total tax liabilities by type',
        'Next 5 filing/payment deadlines',
        'Recent filings with status and amount',
        'YTD tax expense by month and type',
        'Overall compliance health score',
      ]}
      userActions={[
        'Navigate to detail module via KPI card drill-down',
        'View upcoming deadlines and navigate to preparation',
        'Review recent filing activity',
        'Analyze YTD tax expense by type',
        'Export dashboard as PDF summary',
      ]}
    />
  )
}

