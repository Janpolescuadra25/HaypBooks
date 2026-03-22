'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="AR Aging Report"
      module="SALES"
      breadcrumb="Sales / Collections / AR Aging Report"
      purpose="The Sales module's AR Aging Report is the collections-focused view of receivable aging — showing at a glance which customers owe money, how long they've owed it, and what the collection risk is. Unlike the reporting module's static report, this version is interactive — clicking on an aged balance opens the customer's invoices for immediate collection action. It is the primary daily tool of the collections team for prioritizing their work."
      components={[
        { name: 'Aging Summary Grid', description: 'Per-customer row: total balance, current, 1-30, 31-60, 61-90, and 90+ day columns. Sortable by any column.' },
        { name: 'Customer Drill-Down', description: 'Click any aging bucket for a customer to see the specific invoices in that bucket.' },
        { name: 'Aging Totals Row', description: 'Grand total row for all aging buckets at the bottom.' },
        { name: 'Risk Heat Map', description: 'Color-coded cells: green (current), yellow (1-30), amber (31-60), red (61+) for fast visual scanning.' },
        { name: 'Action Integration', description: 'From any overdue row, launch collection action (send reminder, log call) without leaving the aging report.' },
      ]}
      tabs={['By Customer', 'By Invoice', 'Summary', 'Trend']}
      features={[
        'Interactive AR aging report with drill-down',
        'Color-coded risk cells for fast visual scanning',
        'Direct collection action from the aging view',
        'Multiple date-as-of options (today, last month-end)',
        'Export to Excel/PDF for management reporting',
        'Trend: AR aging comparison vs. prior period',
      ]}
      dataDisplayed={[
        'Customer balances by aging bucket',
        'Total current and overdue AR',
        'Percentage of AR in each aging bucket',
        'Specific invoices in each aging bucket on drill-down',
        'Last payment date per customer',
      ]}
      userActions={[
        'View aging as of today or a prior date',
        'Drill into customer aging bucket to see invoices',
        'Send collection reminder from aging view',
        'Export aging report to Excel or PDF',
        'Filter by salesperson or customer segment',
      ]}
      relatedPages={[
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'AR Aging Report (Reporting)', href: '/reporting/reports-center/ar-aging' },
        { label: 'Write-Offs', href: '/sales/collections/write-offs' },
      ]}
    />
  )
}
