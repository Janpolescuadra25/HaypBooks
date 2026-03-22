'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendor Portal"
      module="EXPENSES"
      breadcrumb="Expenses / Vendors / Vendor Portal"
      purpose="The Vendor Portal is a self-service web portal for vendors to submit invoices electronically, check payment status, view their payment history, and update their contact or banking details. When vendors submit invoices through the portal, they enter the invoice data and attach the PDF — the system creates a bill for the AP team's review. This reduces paper-based invoice submission, eliminates manual data entry, and gives vendors transparency on their payment status without having to call or email the AP team."
      components={[
        { name: 'Portal Configuration Panel', description: 'Enable/disable vendor portal, configure branding, and manage available features (invoice submission, payment status).' },
        { name: 'Vendor Access List', description: 'Vendors with portal credentials issued, last login, and pending invoice submissions count.' },
        { name: 'Invoice Submission Queue', description: 'Invoices submitted by vendors through the portal pending AP team review and approval.' },
        { name: 'Portal Preview', description: 'Preview of the vendor-facing portal experience.' },
        { name: 'Vendor Notification Settings', description: 'Email notifications sent to vendors: payment confirmation, statement, invoice received acknowledgment.' },
      ]}
      tabs={['Configuration', 'Vendor Access', 'Invoice Queue', 'Portal Preview', 'Notifications']}
      features={[
        'Electronic invoice submission from vendors',
        'Payment status visibility for vendors',
        'Self-service contact and bank detail updates by vendors',
        'Invoice routing from portal to AP team review',
        'Automated vendor acknowledgment emails',
        'Reduce AP data entry through portal submission',
      ]}
      dataDisplayed={[
        'Vendors with portal access',
        'Invoices submitted via portal (pending and processed)',
        'Vendor payment status visible in portal',
        'Portal usage metrics',
      ]}
      userActions={[
        'Enable vendor portal access',
        'Invite a vendor to the portal',
        'Review and process portal-submitted invoices',
        'Configure portal branding',
        'Configure vendor notification emails',
      ]}
      relatedPages={[
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
      ]}
    />
  )
}

