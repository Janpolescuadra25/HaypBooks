'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='AR Aging'
      module='SALES'
      breadcrumb='Sales / Collections / AR Aging'
      purpose='Accounts receivable aging report that categorizes outstanding customer invoices into aging buckets — current, 1–30, 31–60, 61–90, and 90+ days overdue. Provides the primary tool for collections prioritization and cash flow management.'
      components={[
        { name: 'AR Aging Summary', description: 'Total receivable balance by aging bucket across all customers' },
        { name: 'Customer Aging Detail', description: 'Per-customer breakdown of invoices in each aging bucket' },
        { name: 'Aging Chart', description: 'Visual bar chart comparing balance distribution across age groups' },
        { name: 'Collection Priority Queue', description: 'Auto-sorted list of customers by overdue amount for collection action' },
        { name: 'As-of Date Selector', description: 'Run aging as of any historical date for period-end reporting' },
      ]}
      tabs={['Summary', 'By Customer', 'By Currency', 'Collection Priority']}
      features={['Current and overdue balance breakdown by age', 'Per-customer invoice-level detail', 'As-of-date flexibility for historical aging', 'Collection priority auto-sorted queue', 'Multi-currency aging support', 'Export for collections team workflow', 'Drill into invoice from aging report']}
      dataDisplayed={['Total AR balance', 'Balance by aging bucket (current, 1-30, 31-60, 61-90, 90+)', 'Customer names and total owed', 'Oldest outstanding invoice date', 'Percentage of AR in each bucket', 'Days sales outstanding (DSO)', 'Disputed invoice amounts']}
      userActions={['View AR aging summary', 'Drill into customer aging detail', 'Export aging report', 'Prioritize collections by overdue amount', 'Filter by aging bucket', 'Run as-of historical date aging', 'Initiate collection action from report']}
      relatedPages={[
        { label: 'AR Aging Alerts', href: '/sales/collections/ar-aging-alerts' },
        { label: 'Dunning Management', href: '/sales/collections/dunning-management' },
        { label: 'Customer Statements', href: '/sales/billing/customer-statements' },
      ]}
    />
  )
}
