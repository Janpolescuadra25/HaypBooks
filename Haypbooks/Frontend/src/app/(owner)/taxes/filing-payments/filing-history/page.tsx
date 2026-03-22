'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function FilingHistoryPage() {
  return (
    <PageDocumentation
      title="Filing History"
      module="TAXES"
      breadcrumb="Taxes / Filing & Payments / Filing History"
      purpose="Filing History is a complete archive of all tax returns and payments filed through Haypbooks, providing a searchable record for compliance audits and lookback references. Every filing entry includes the tax type, period, filed amount, submission method, and confirmation details. This page acts as the single source of truth for demonstrating compliance with tax filing obligations across all periods."
      components={[
        { name: 'Filing History Table', description: 'Sortable archive table with tax type, period, filed amount, submission date, method, and status.' },
        { name: 'Tax Type & Period Filters', description: 'Dropdown filters for tax authority, form type, and date range to narrow history search.' },
        { name: 'Detail Drawer', description: 'Slide-out panel showing full details of a selected filing: submitted form copy, payment confirmation.' },
        { name: 'Amendment Flag', description: 'Indicator on any filing that has been subsequently amended, with link to the amendment record.' },
        { name: 'Export to PDF / CSV', description: 'Export filtered or full history as a PDF report or CSV data file for auditor submission.' },
      ]}
      tabs={['All Filings', 'Income Tax', 'VAT / GST', 'Withholding', 'Payroll Tax']}
      features={[
        'Complete archive of all tax filings with period and amount details',
        'Filter by tax type, authority, period, and filing status',
        'View filed form copy and payment confirmation in detail drawer',
        'Identify and access amended returns flagged in history',
        'Export filing history for external audit documentation',
        'Trace each filing back to source return data in Haypbooks',
      ]}
      dataDisplayed={[
        'Tax form type and filing period',
        'Filed amount and payment date',
        'Submission method (e-filed, manual, agent)',
        'Confirmation/reference number',
        'Amendment status and link',
      ]}
      userActions={[
        'Search and filter filing history',
        'View full filing detail with form copy',
        'Export filing history report',
        'Navigate to amendment record',
        'Download acknowledgment receipt',
      ]}
    />
  )
}

