'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Estimate List"
      module="SALES"
      breadcrumb="Sales / Estimates / Estimate List"
      purpose="The Estimate List manages all customer quotations and proposals — the pre-invoice stage of the sales process. Estimates list the products or services being offered, quantities, unit prices, taxes, and totals. When a customer accepts an estimate, it can be converted to an invoice with a single click, flowing all the line items automatically. Estimates have statuses (Draft, Sent, Accepted, Rejected, Expired) and can include expiry dates, terms, and notes."
      components={[
        { name: 'Estimate Table', description: 'All estimates with estimate number, customer, date, expiry date, total amount, and status.' },
        { name: 'Estimate Editor', description: 'Full estimate document editor: header (customer, date, expiry, terms), line items, taxes, discounts, totals, and notes.' },
        { name: 'Status Pipeline', description: 'Kanban-style or pipeline view showing estimates by status: Draft → Sent → Accepted/Rejected.' },
        { name: 'Convert to Invoice Button', description: 'One-click conversion of an accepted estimate to an invoice, carrying all line items and customer details.' },
        { name: 'Estimate PDF Preview', description: 'Professional PDF preview of estimate document for review before sending to customer.' },
      ]}
      tabs={['All Estimates', 'Draft', 'Sent', 'Accepted', 'Expired/Rejected']}
      features={[
        'Full estimate document creation and management',
        'Expiry date and reminder management',
        'One-click conversion to invoice upon acceptance',
        'Email estimate to customer from within the system',
        'PDF generation with company branding',
        'Estimate acceptance tracking',
        'Conversion rate reporting (estimates to invoices)',
      ]}
      dataDisplayed={[
        'All estimates with number, customer, and status',
        'Estimate totals by status',
        'Expiring soon alerts',
        'Acceptance rate and conversion rate to invoice',
        'Revenue pipeline from open estimates',
      ]}
      userActions={[
        'Create a new estimate',
        'Add line items, prices, and taxes',
        'Send estimate to customer via email',
        'Update estimate status (mark as accepted/rejected)',
        'Convert accepted estimate to invoice',
        'Clone an estimate for a new customer',
        'Export estimate list to Excel',
      ]}
      relatedPages={[
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'Estimate Settings', href: '/sales/estimates/estimate-settings' },
      ]}
    />
  )
}

