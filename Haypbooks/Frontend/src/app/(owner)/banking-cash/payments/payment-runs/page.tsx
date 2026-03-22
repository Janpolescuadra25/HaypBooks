'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Payment Runs"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Payments / Payment Runs"
      purpose="Payment Runs manages the company's regular scheduled payment cycles — weekly vendor payment runs, bi-monthly supplier settlements, and ad-hoc urgent payment runs. A payment run collects all bills meeting the configured criteria (due by date, vendor group, amount range), proposes the payment list, gets approval, executes the payments, and updates the AP ledger. Payment run settings can be templated for repeated use on a schedule."
      components={[
        { name: 'Payment Run Settings', description: 'Configure run criteria: due date cutoff, vendor group, minimum/maximum payment amount, pay-from bank account.' },
        { name: 'Proposed Payments List', description: 'Auto-generated list of all bills meeting the run criteria with vendor, invoice reference, due date, and amount.' },
        { name: 'Exclusion Manager', description: 'Remove specific bills from the proposed run (e.g., disputed invoices) before proceeding.' },
        { name: 'Run Approval', description: 'Submit run for approval with total amount, vendor count, and funding bank account details.' },
        { name: 'Run Execution', description: 'Post all payments in the run to the GL and generate bank transfer files or print checks.' },
        { name: 'Run History', description: 'Archive of all payment runs with date, criteria summary, total amount, and GL posting status.' },
      ]}
      tabs={['Configure Run', 'Proposed Payments', 'Approve Run', 'Execute', 'History']}
      features={[
        'Criteria-based automatic bill selection for payment run',
        'Exclusion management before execution',
        'Multi-step approval for payment runs',
        'Batch GL posting upon execution',
        'Bank file or check generation',
        'Payment run templates for recurring cycles',
        'Remittance advice generation per vendor',
      ]}
      dataDisplayed={[
        'Bills selected for the run meeting criteria',
        'Total run amount and vendor count',
        'Approval status',
        'Excluded bills and exclusion reasons',
        'Bank account used and available balance',
        'Payment run history',
      ]}
      userActions={[
        'Configure payment run criteria',
        'Review and adjust proposed payments',
        'Exclude specific bills from run',
        'Approve the payment run',
        'Execute the payment run',
        'Generate bank files or print checks',
        'View payment run history',
      ]}
      relatedPages={[
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
        { label: 'Batch Payments', href: '/banking-cash/payments/batch-payments' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'AP Aging', href: '/reporting/reports-center/ap-aging' },
      ]}
    />
  )
}

