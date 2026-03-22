'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Customer Statements'
      module='SALES'
      breadcrumb='Sales / Billing / Customer Statements'
      purpose='Generates and distributes periodic account statements to customers showing all transactions, invoice details, payments received, credits applied, and outstanding balances. Supports both on-demand and automated scheduled statement distribution to maintain customer transparency.'
      components={[
        { name: 'Statement Generator', description: 'Creates formatted customer statements for any date range with all transaction detail' },
        { name: 'Customer Selection Panel', description: 'Filter and select individual customers or customer groups for batch statement run' },
        { name: 'Statement Template Editor', description: 'Customize header, footer, branding, and column layout of statement PDF' },
        { name: 'Auto-Delivery Scheduler', description: 'Configure scheduled monthly or periodic automatic statement email delivery' },
        { name: 'Outstanding Balance Highlighter', description: 'Color-codes overdue amounts and aging buckets for clarity' },
      ]}
      tabs={['Generate Statements', 'Delivered Statements', 'Scheduled Deliveries', 'Statement Templates']}
      features={['On-demand and scheduled statement generation', 'Batch statement processing for multiple customers', 'Custom branding and template layout', 'Email delivery with read receipt tracking', 'Outstanding balance aging color coding', 'Drill-through from statement to individual invoice', 'Statement delivery history log']}
      dataDisplayed={['Customer name and account number', 'Statement period', 'Opening balance', 'Invoices issued during period', 'Payments and credits applied', 'Closing balance', 'Aged balance buckets']}
      userActions={['Generate customer statement', 'Customize statement template', 'Send statement via email', 'Schedule automatic statement delivery', 'View statement delivery history', 'Batch generate for multiple customers', 'Export statement to PDF']}
      relatedPages={[
        { label: 'AR Aging', href: '/sales/collections/ar-aging' },
        { label: 'Dunning Management', href: '/sales/collections/dunning-management' },
        { label: 'Customers', href: '/sales/customers/customer-documents' },
      ]}
    />
  )
}

