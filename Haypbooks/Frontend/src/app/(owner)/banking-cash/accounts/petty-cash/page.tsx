'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Petty Cash"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Accounts / Petty Cash"
      purpose="Petty Cash manages the company's imprest petty cash funds. Each petty cash fund has a set balance, a custodian, and a running log of disbursements and replenishments. When the fund is used (for small purchases), a disbursement is recorded with the expense category and amount. When the fund balance runs low, a replenishment check is cut from the main bank account, bringing the fund back to its fixed float amount. Month-end reconciliation confirms the physical cash matches the system record."
      components={[
        { name: 'Fund Summary', description: 'All petty cash funds with fund name, custodian, fund float amount, current balance (after disbursements), and last reconciled date.' },
        { name: 'Disbursement Log', description: 'All petty cash disbursements with date, payee/purpose, amount, expense account, and approved by.' },
        { name: 'Replenishment Request', description: 'Calculate replenishment amount (float minus current balance) and create reimbursement journal entry to restore the fund.' },
        { name: 'Fund Reconciliation', description: 'Count physical cash, compare to system balance, document any discrepancies, and certify the monthly reconciliation.' },
      ]}
      tabs={['Fund Summary', 'Disbursements', 'Replenishments', 'Reconciliation']}
      features={[
        'Multi-fund petty cash management',
        'Custodian assignment per fund',
        'Disbursement recording with GL coding',
        'Automatic replenishment calculation',
        'Monthly physical count reconciliation',
        'Petty cash usage by expense category',
      ]}
      dataDisplayed={[
        'Fund float amount and current balance',
        'Disbursements since last replenishment',
        'Replenishment amount needed',
        'Custodian and last reconciliation date',
        'Spending by expense category',
      ]}
      userActions={[
        'Record a petty cash disbursement',
        'Attach receipt to disbursement',
        'Request fund replenishment',
        'Post replenishment journal entry',
        'Conduct and certify monthly reconciliation',
        'Add a new petty cash fund',
        'Change fund custodian',
      ]}
      relatedPages={[
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Expense Reports', href: '/expenses/expense-reports/my-expenses' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
      ]}
    />
  )
}

