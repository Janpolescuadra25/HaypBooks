'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function FiscalYearSetupPage() {
  return (
    <PageDocumentation
      title="Fiscal Year Setup"
      module="SETTINGS"
      breadcrumb="Settings / Company Profile / Fiscal Year Setup"
      purpose="Fiscal Year Setup defines the accounting year boundaries, period structure, and how financial reports are aligned to those periods. Businesses with non-calendar fiscal years (e.g., April–March or July–June) configure their year start here, which flows through to all period-based reports and closing workflows. This setting also determines how comparative financial statements are structured."
      components={[
        { name: 'Fiscal Year Dates', description: 'Month-picker controls for fiscal year start month with auto-calculation of end month.' },
        { name: 'Period Configuration', description: 'Choose between 12 monthly periods, 13 four-week periods, or quarterly period groupings.' },
        { name: 'Current Year Display', description: 'Summary showing current active fiscal year, open periods, and period close progress.' },
        { name: 'Year-over-Year Comparatives', description: 'Toggle to enable prior-year comparative columns in balance sheet and income statement.' },
        { name: 'Lock Completed Years', description: 'Option to lock all transactions in prior completed fiscal years automatically after close.' },
      ]}
      tabs={['Year Setup', 'Period List', 'Prior Years']}
      features={[
        'Set fiscal year start and end months to match business reporting cycle',
        'Choose 12-month, 13-period (4-4-5), or quarterly period structure',
        'View all accounting periods in current and prior fiscal years',
        'Enable automatic prior-year locking after year-end close',
        'Configure comparative period display in financial reports',
        'Track which periods are open, in review, or permanently closed',
      ]}
      dataDisplayed={[
        'Current fiscal year start and end dates',
        'Period structure type (monthly/quarterly/13-period)',
        'Status of each period (open, reviewing, closed)',
        'Prior fiscal years with close dates',
        'Days remaining in current fiscal year',
      ]}
      userActions={[
        'Set or change the fiscal year start month',
        'Configure the accounting period structure',
        'Open or close individual accounting periods',
        'Lock a completed prior fiscal year',
        'View period status calendar',
      ]}
    />
  )
}

