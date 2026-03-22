'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function BillingHistoryPage() {
  return (
    <PageDocumentation
      title="Billing History"
      module="SETTINGS"
      breadcrumb="Settings / Account & Billing / Billing History"
      purpose="Billing History provides a complete chronological record of all invoices, charges, and payment receipts tied to your Haypbooks subscription. Finance administrators use this page to download invoices for accounting records, monitor payment status, and resolve any billing discrepancies. Every transaction is timestamped and includes a downloadable PDF receipt for audit compliance."
      components={[
        { name: 'Invoice Table', description: 'Sortable list of all past invoices with date, amount, status, and PDF download action.' },
        { name: 'Payment Status Badges', description: 'Color-coded badges showing Paid, Pending, Failed, or Refunded status per transaction.' },
        { name: 'Date Range Filter', description: 'Filter billing records by custom date range or preset periods such as last 30 days or current year.' },
        { name: 'Invoice Detail Drawer', description: 'Slide-out panel showing full invoice breakdown including line items, taxes, and payment method used.' },
        { name: 'Export Controls', description: 'Bulk export all billing records to CSV or PDF for upload to external accounting systems.' },
      ]}
      tabs={['All Invoices', 'Payments', 'Credits & Refunds', 'Failed Transactions']}
      features={[
        'View complete invoice history with amounts, due dates, and payment confirmations',
        'Download individual or bulk invoices as PDF for expense reporting',
        'Filter history by date range, invoice status, or billing cycle',
        'View payment method used for each transaction',
        'Identify and dispute failed or declined payments with support link',
        'Track subscription credits and promo codes applied to invoices',
      ]}
      dataDisplayed={[
        'Invoice number and issue date',
        'Billed amount with currency and tax breakdown',
        'Payment status and settlement date',
        'Subscription plan and term covered',
        'Payment method (card last 4 digits or bank name)',
      ]}
      userActions={[
        'Download PDF invoice for any transaction',
        'Filter records by date range or payment status',
        'Export full billing history to CSV',
        'View itemized invoice detail in drawer',
        'Contact support for billing discrepancies',
      ]}
    />
  )
}

