'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Exceptions By Type"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Exceptions / By Type"
      purpose="Exceptions By Type groups all exceptions by their exception category (e.g., Bank Feed Errors, Duplicate Transactions, Validation Failures, Matching Failures, Tax Calculation Errors) to help teams identify systemic issues. If a particular exception type is occurring frequently, it indicates a configuration problem or integration issue requiring root-cause investigation."
      components={[
        { name: 'Exception Type Summary', description: 'Grid of exception type cards each showing count, trend (up/down), and last occurred date.' },
        { name: 'Type Detail Drilldown', description: 'Click an exception type to see all instances of that type with full details.' },
        { name: 'Frequency Chart', description: 'Bar or line chart showing exception frequency by type over the past 30/60/90 days.' },
        { name: 'Resolution Rate', description: 'Per-type resolution rate (% resolved within SLA) and average resolution time.' },
      ]}
      tabs={['By Count', 'By Module', 'Trend View', 'Resolution Rates']}
      features={[
        'Exception categorization by root cause type',
        'Systemic issue identification via frequency analysis',
        'Resolution rate metrics by exception type',
        'Trend analysis to detect recurring patterns',
        'Root cause recommendations per exception type',
      ]}
      dataDisplayed={[
        'Exception type names and descriptions',
        'Count per type (open and resolved)',
        'Frequency trend (last 30/60/90 days)',
        'Average resolution time per type',
        'Source modules generating each exception type',
      ]}
      userActions={[
        'Drill into an exception type to see all instances',
        'Filter by date range or module',
        'Export exception-by-type analysis report',
        'Configure alerts for exception type threshold breaches',
      ]}
      relatedPages={[
        { label: 'Exception Queue', href: '/tasks-approvals/exceptions/exception-queue' },
        { label: 'Resolution Log', href: '/tasks-approvals/exceptions/resolution-log' },
        { label: 'My Exceptions', href: '/tasks-approvals/my-work/my-exceptions' },
      ]}
    />
  )
}

