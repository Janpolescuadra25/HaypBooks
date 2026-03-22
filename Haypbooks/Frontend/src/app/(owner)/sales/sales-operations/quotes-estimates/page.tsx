'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Quotes & Estimates'
      module='SALES'
      breadcrumb='Sales / Sales Operations / Quotes & Estimates'
      purpose='Enables creation, management, and tracking of sales quotes and estimates sent to prospective or existing customers. Supports version control, expiry management, and one-click conversion of accepted quotes to sales orders or invoices.'
      components={[
        { name: 'Quote Builder', description: 'Itemized quote creation with products, quantities, prices, taxes, discounts, and terms' },
        { name: 'Quote Status Workflow', description: 'Manages lifecycle: draft, sent, accepted, declined, expired' },
        { name: 'Version Manager', description: 'Tracks multiple quote revisions with comparison view' },
        { name: 'Quote-to-Order Conversion', description: 'One-click conversion of accepted quote to sales order or invoice' },
        { name: 'Expiry Alert System', description: 'Automated reminders for quotes approaching or past their expiry date' },
        { name: 'Client-Facing Quote Portal', description: 'Customer-facing link for online quote review and acceptance' },
      ]}
      tabs={['All Quotes', 'Draft', 'Sent', 'Accepted', 'Declined', 'Expired']}
      features={['Itemized quote creation with discount support', 'Quote versioning and revision tracking', 'One-click conversion to sales order', 'Client e-acceptance via portal', 'Expiry date management and alerts', 'PDF quote generation with branding', 'Win/loss tagging on quote resolution']}
      dataDisplayed={['Quote number and version', 'Customer name and contact', 'Quote date and expiry date', 'Line items with quantities and prices', 'Discount applied', 'Total quote value with tax', 'Quote status']}
      userActions={['Create new quote', 'Add line items to quote', 'Apply discount to quote', 'Send quote to customer', 'Record acceptance or rejection', 'Convert to sales order', 'Export quote as PDF']}
      relatedPages={[
        { label: 'Sales Orders', href: '/sales/sales-operations/sales-orders' },
        { label: 'Products & Services', href: '/sales/sales-operations/products-services' },
        { label: 'Price Lists', href: '/sales/customers/price-lists' },
      ]}
    />
  )
}

