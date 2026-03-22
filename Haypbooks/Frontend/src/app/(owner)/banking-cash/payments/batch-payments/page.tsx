'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Batch Payments"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Payments / Batch Payments"
      purpose="Batch Payments allows processing of large volumes of vendor payments in a single batch — generating a batch file for bank upload (ACH/EFT/IBT format). Commonly used for payroll funding runs, weekly vendor payment runs, and bulk supplier settlements. The batch file is created within the system and exported in the format required by the company's bank (CSV, XML, or proprietary bank format) for upload to the bank's payment portal."
      components={[
        { name: 'Batch Creator', description: 'Select payment run type (vendor, payroll, utility), choose bank account to pay from, select payment recipients and amounts.' },
        { name: 'Batch Payment Table', description: 'Line-item table of all payments in the batch: payee, account number, amount, and payment reference.' },
        { name: 'Bank File Export', description: 'Generate bank-specific batch upload file (CSV, XML, NavisionPay, PhilPass format) for upload to the bank portal.' },
        { name: 'Batch Approval', description: 'Multi-step approval workflow for batch payments above threshold limits.' },
        { name: 'Batch History', description: 'Archive of all batch payment files created with date, total amount, number of payees, and bank confirmation status.' },
      ]}
      tabs={['Create Batch', 'Pending Approval', 'Batch Files', 'History']}
      features={[
        'Multi-payee batch payment creation',
        'Bank-specific file format export (ACH, EFT, InstaPay)',
        'Approval workflow for high-value batches',
        'Duplicate payee detection',
        'Payment reference generation per payee',
        'Automatic AP ledger update upon batch confirmation',
        'Bank confirmation status tracking',
      ]}
      dataDisplayed={[
        'All payees in the batch with amounts',
        'Total batch amount and payee count',
        'Bank file format and readiness status',
        'Approval status for each batch',
        'Historical batches with confirmation status',
      ]}
      userActions={[
        'Create a new payment batch',
        'Add or remove payees from a batch',
        'Approve a batch for processing',
        'Export bank file for portal upload',
        'Mark batch as confirmed after bank processing',
        'View batch history and download prior files',
      ]}
      relatedPages={[
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
        { label: 'Payment Runs', href: '/banking-cash/payments/payment-runs' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'AP Aging', href: '/reporting/reports-center/ap-aging' },
      ]}
    />
  )
}

