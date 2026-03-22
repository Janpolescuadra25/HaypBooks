'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendor Credit Notes"
      module="EXPENSES"
      breadcrumb="Expenses / Bills / Vendor Credit Notes"
      purpose="Vendor Credit Notes manages credits issued by vendors in favor of the company — for returned goods, billing errors, pricing adjustments, or vendor rebates. Each credit note reduces the amount owed to the vendor (AP balance). Credits can be applied against existing open bills, requested as a refund payment, or held as a vendor credit balance for future bills. Properly recording vendor credits ensures accurate AP balances and vendor statement reconciliation."
      components={[
        { name: 'Credit Notes List', description: 'All vendor credit notes with credit note number, vendor, date, reference bill, amount, and status.' },
        { name: 'Credit Note Entry Form', description: 'Enter a vendor credit note: vendor, issue date, vendor-provided credit note number, line items or full amount, and reason.' },
        { name: 'Apply Credit Panel', description: 'Apply the credit against a specific open bill or hold as vendor credit balance.' },
        { name: 'Vendor Credit Balances', description: 'Per-vendor unapplied credit note balances — available credits to apply to future bills.' },
      ]}
      tabs={['All Credit Notes', 'Open Credits', 'Applied', 'Requested Refund']}
      features={[
        'Vendor credit note recording and management',
        'Apply credit against specific open bills',
        'Hold credit as vendor balance for future bills',
        'Request cash refund from vendor for unapplied credit',
        'Vendor credit note impacts AP balance immediately',
        'Track reason codes for credits received',
      ]}
      dataDisplayed={[
        'All vendor credit notes with status',
        'Unapplied credit balances per vendor',
        'Credit applied to which specific bills',
        'Total vendor credits available',
      ]}
      userActions={[
        'Enter a new vendor credit note',
        'Apply credit to an open bill',
        'Request refund from vendor',
        'View vendor credit balance',
        'Export credit notes list',
      ]}
      relatedPages={[
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'AP Aging', href: '/reporting/reports-center/ap-aging' },
      ]}
    />
  )
}

