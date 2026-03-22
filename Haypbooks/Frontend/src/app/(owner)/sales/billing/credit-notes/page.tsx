'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Notes"
      module="SALES"
      breadcrumb="Sales / Billing / Credit Notes"
      purpose="Credit Notes are issued to customers to reduce or cancel the amount owed on a previously issued invoice — for returns, billing errors, discounts granted after invoicing, or service credits. Each credit note references the original invoice, specifies the reason for the credit, and reduces the customer's AR balance. Credit notes can be applied against existing open invoices, paid out as a refund, or held as a customer credit for future invoices."
      components={[
        { name: 'Credit Notes Table', description: 'All issued credit notes with credit note number, customer, date, reference invoice, amount, and status (open/applied/refunded).' },
        { name: 'Credit Note Creator', description: 'Create a credit note: select customer, reference invoice, reason for credit, line items or full amount, and issue date.' },
        { name: 'Apply Credit Panel', description: 'Apply an open credit note against a specific open invoice or hold as customer credit balance.' },
        { name: 'Refund Processing', description: 'Convert an unapplied credit note to a cash refund paid back to the customer.' },
        { name: 'Credit Balance Summary', description: 'Per-customer unapplied credit note balance available for future invoices.' },
      ]}
      tabs={['All Credit Notes', 'Open Credits', 'Applied', 'Refunded']}
      features={[
        'Full credit note document creation and distribution',
        'Apply credit against specific open invoices',
        'Hold credit as customer balance for future invoices',
        'Cash refund workflow from credit note',
        'Email credit note PDF to customer',
        'Reason code tracking for credits issued',
        'Impact on AR and revenue clearly shown',
      ]}
      dataDisplayed={[
        'All credit notes with amount and status',
        'Reference invoice per credit note',
        'Unapplied customer credit balances',
        'Total credits issued YTD',
        'Reason codes and distribution',
      ]}
      userActions={[
        'Create a new credit note',
        'Apply credit to an open invoice',
        'Convert credit to cash refund',
        'Email credit note to customer',
        'Export credit notes list',
      ]}
      relatedPages={[
        { label: 'Invoices', href: '/sales/billing/invoices' },
        { label: 'Customer List', href: '/sales/customers/customer-list' },
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
      ]}
    />
  )
}

