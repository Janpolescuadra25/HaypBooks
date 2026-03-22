'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Reconciliation Reports"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Reconciliation / Reconciliation Reports"
      purpose="Reconciliation Reports provides the completed bank reconciliation documentation — the formal, printable reconciliation statement for each account and each month. The report shows the closing bank balance, adds/subtracts reconciling items (outstanding deposits, outstanding checks), and arrives at the GL cash balance, proving the two agree. These reports serve as audit evidence for the monthly close and are stored for all prior periods."
      components={[
        { name: 'Reconciliation Statement', description: 'Formal bank reconciliation: bank statement closing balance + deposits in transit − outstanding checks = GL book balance.' },
        { name: 'Reconciliation Archive', description: 'All completed reconciliations by account and period with completion date and completed by user.' },
        { name: 'Outstanding Items Detail', description: 'Detailed list of all uncleared checks and deposits in transit as at the reconciliation date.' },
        { name: 'Reconciliation Summary Dashboard', description: 'Show all accounts with their last reconciliation date, status (current/overdue), and unreconciled item count.' },
      ]}
      tabs={['Reconciliation Statements', 'Outstanding Items', 'Archive', 'Summary']}
      features={[
        'Formal printed bank reconciliation statement',
        'Outstanding items detail listing',
        'Prior period reconciliation archive',
        'Reconciliation status dashboard across all accounts',
        'Export to PDF for audit files',
        'Locked reconciliation once certified',
      ]}
      dataDisplayed={[
        'Bank statement closing balance',
        'Deposits in transit',
        'Outstanding checks/payments',
        'Reconciled GL cash balance',
        'Completion date and completed by user',
        'All prior period reconciliation records',
      ]}
      userActions={[
        'View completed reconciliation statement',
        'Print/export reconciliation statement as PDF',
        'View outstanding items list',
        'Navigate to complete an overdue reconciliation',
        'Filter archive by account or period',
      ]}
      relatedPages={[
        { label: 'Reconcile', href: '/banking-cash/reconciliation/reconcile' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
        { label: 'Period Close', href: '/accounting/period-close/close-checklist' },
      ]}
    />
  )
}

