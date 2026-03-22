'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Billing History"
      module="SETTINGS"
      breadcrumb="Settings / Billing / Billing History"
      purpose="Billing History shows all past invoices and payment receipts from Haypbooks to the company for their subscription. Each line shows the billing period, plan, amount charged, payment method, and payment status. Invoices can be downloaded as PDFs for accounting records. The billing history provides the trail needed to verify subscription charges recognized in the company's own accounting system and to resolve any billing disputes with Haypbooks support."
      components={[
        { name: 'Invoice List', description: 'All historical Haypbooks subscription invoices with billing period, amount, and payment status.' },
        { name: 'Payment Method', description: 'Current payment method on file (credit card last 4 digits, or bank transfer). Update payment method here.' },
        { name: 'Download Invoice PDF', description: "Download any past invoice as a PDF for the company's own AP records." },
        { name: 'Failed Payment Recovery', description: 'If a payment fails: retry button and alternative payment method option.' },
      ]}
      tabs={['Invoice History', 'Payment Method', 'Failed Payments']}
      features={[
        'Complete Haypbooks subscription billing history',
        'Invoice PDF download for company accounting',
        'Payment method management',
        'Failed payment notification and retry',
        'VAT receipt available (if applicable)',
      ]}
      dataDisplayed={[
        'All subscription invoices with amounts and dates',
        'Payment status per invoice',
        'Current payment method',
        'Failed payments (if any)',
      ]}
      userActions={[
        'View all past subscription invoices',
        'Download invoice PDF',
        'Update payment method',
        'Retry a failed payment',
        'Contact support for billing dispute',
      ]}
      relatedPages={[
        { label: 'Subscription', href: '/settings/billing/subscription' },
        { label: 'Company Profile', href: '/settings/company/company-profile' },
      ]}
    />
  )
}

