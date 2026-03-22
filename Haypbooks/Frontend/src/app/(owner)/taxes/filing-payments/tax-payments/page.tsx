'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxPaymentsPage() {
  return (
    <PageDocumentation
      title="Tax Payments"
      module="TAXES"
      breadcrumb="Taxes / Filing & Payments / Tax Payments"
      purpose="Tax Payments records and manages all outgoing payments made to tax authorities — including income tax installments, VAT payments, withholding tax remittances, and other duty payments. Each payment is matched to the corresponding tax liability on the books, generating the journal entries needed to reduce the tax payable account. The page helps prevent over- or under-payment by reconciling tax due against amounts already paid."
      components={[
        { name: 'Payments Ledger', description: 'Chronological ledger of all recorded tax payments with authority, tax type, period, and amount.' },
        { name: 'Record Payment Form', description: 'Form to log a new tax payment: authority, tax type, period covered, payment date, amount, and reference.' },
        { name: 'Liability Match Panel', description: 'Shows the tax liability associated with each payment and resulting remaining balance.' },
        { name: 'Payment Status Badges', description: 'Visual status indicators: Scheduled, Paid, Overdue, Partially Paid for each obligation.' },
        { name: 'Bank Account Selector', description: 'Dropdown to link each payment to the source bank account for automatic cash book entry.' },
      ]}
      tabs={['All Payments', 'Scheduled', 'Paid', 'Overdue']}
      features={[
        'Record all tax payments across all tax types and authorities',
        'Match payments to outstanding tax liabilities',
        'Auto-generate journal entries to reduce tax payable account',
        'Track scheduled upcoming payments and overdue obligations',
        'Link payment to source bank account for cash flow accuracy',
        'Export payment ledger for reconciliation and audit',
      ]}
      dataDisplayed={[
        'Tax authority and type of tax paid',
        'Period covered and payment date',
        'Amount paid and reference number',
        'Remaining liability balance after payment',
        'Bank account used for payment',
      ]}
      userActions={[
        'Record a new tax payment',
        'Match payment to outstanding liability',
        'View remaining liability after payment',
        'Schedule a future tax payment',
        'Export tax payment ledger',
      ]}
    />
  )
}

