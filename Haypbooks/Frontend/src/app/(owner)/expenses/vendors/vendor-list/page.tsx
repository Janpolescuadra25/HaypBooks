'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendor List"
      module="EXPENSES"
      breadcrumb="Expenses / Vendors / Vendor List"
      purpose="The Vendor List is the master directory of all supplier and vendor accounts. Each vendor record stores company name, contact details, billing address, payment terms, bank account details (for payment), tax registration number (TIN), AP account mapping, and current AP balance. The vendor database drives the purchase order, bills, and payment workflows — ensuring accurate and consistent vendor information across all procurement and payables processes."
      components={[
        { name: 'Vendor Table', description: 'All vendors with name, contact, phone, email, payment terms, TIN, current AP balance, and status.' },
        { name: 'Vendor Profile Card', description: 'Full vendor record: company details, contacts, address, payment terms, payment account details (bank/account for EFT), and GL AP account.' },
        { name: 'AP Balance per Vendor', description: 'Current AP outstanding, aging summary, and last payment date.' },
        { name: 'Vendor Documents Folder', description: 'Store filed documents per vendor: business registration, BIR TIN certificate, contract, price list.' },
        { name: 'Transaction Timeline', description: 'Chronological activity: POs, bills, payments, and credit notes from this vendor.' },
      ]}
      tabs={['All Vendors', 'Active', 'By Category', 'Overdue Payables']}
      features={[
        'Comprehensive vendor master data management',
        'Payment terms and bank details management',
        'Vendor-level AP balance and aging',
        'Document storage per vendor',
        'TIN and tax compliance fields for 1099/2307',
        'Vendor category tagging for reporting',
        'Bulk CSV import/export',
      ]}
      dataDisplayed={[
        'Vendor name, TIN, and contact details',
        'Payment terms and bank payment details',
        'Current AP balance and aging buckets',
        'Last bill date and last payment date',
        'Total spend YTD from vendor',
      ]}
      userActions={[
        'Add a new vendor',
        'Update contact or payment details',
        'Change payment terms',
        'Update bank details for EFT payment',
        'View vendor AP balance and bills',
        'Attach vendor document',
        'Deactivate an inactive vendor',
        'Export vendor list',
      ]}
      relatedPages={[
        { label: 'Purchase Orders', href: '/expenses/purchase-orders/po-list' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
        { label: 'AP Aging', href: '/reporting/reports-center/ap-aging' },
      ]}
    />
  )
}

