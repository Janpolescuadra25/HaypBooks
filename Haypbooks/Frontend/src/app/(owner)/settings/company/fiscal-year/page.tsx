'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Fiscal Year"
      module="SETTINGS"
      breadcrumb="Settings / Company / Fiscal Year"
      purpose="Fiscal Year configures the company's accounting year — when it starts and ends. The most common is January 1 to December 31 (calendar year), but some companies use April 1 – March 31 or July 1 – June 30 fiscal years based on their SEC registration or business cycle. The fiscal year setting affects period-end processing, annual report generation, BIR annual tax return due dates, tax calendar, budget periods, and all year-to-date calculations across the system. Changing fiscal year requires a system administrator and may require year-end close processing."
      components={[
        { name: 'Fiscal Year Configuration', description: 'Set fiscal year start month (January = calendar year, or any other month for non-calendar fiscal year).' },
        { name: 'Accounting Periods List', description: 'All 12 (or 13 for some configurations) accounting periods for the fiscal year with open/closed status.' },
        { name: 'Year-End Close Status', description: 'Current year-end close progress: periods locked, retained earnings entry posted, beginning balances for new year set.' },
        { name: 'Prior Year Archives', description: 'Access to prior fiscal year data and opening balance history.' },
      ]}
      tabs={['Fiscal Year Settings', 'Accounting Periods', 'Year-End Close', 'Prior Years']}
      features={[
        'Fiscal year start/end month configuration',
        '12-period accounting calendar management',
        'Year-end close workflow support',
        'Retained earnings posting at year close',
        'Prior year financial data access',
        'BIR tax return due date integration with fiscal year',
      ]}
      dataDisplayed={[
        'Current fiscal year and periods',
        'Each period: open or closed status',
        'Year-end close step completion status',
        'Prior fiscal years archive',
      ]}
      userActions={[
        'Set fiscal year start month (initial setup)',
        'Open or close an accounting period',
        'Initiate year-end close process',
        'Post retained earnings entry',
        'Access prior year data',
      ]}
      relatedPages={[
        { label: 'Company Profile', href: '/settings/company/company-profile' },
        { label: 'Period Close Checklist', href: '/accounting/period-close/close-checklist' },
        { label: 'Lock Periods', href: '/accounting/period-close/lock-periods' },
        { label: 'Tax Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
      ]}
    />
  )
}

