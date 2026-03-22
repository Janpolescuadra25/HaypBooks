'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Banking Reports'
      module='REPORTING'
      breadcrumb='Reporting / Reports Center / Banking Reports'
      purpose='Provides comprehensive bank-related reports including bank reconciliation summaries, cash position statements, outstanding checks and deposits, bank transaction listings, and bank fee analysis. Supports cash management decision-making and internal audit requirements.'
      components={[
        { name: 'Bank Reconciliation Summary', description: 'Status of all bank account reconciliations with outstanding items' },
        { name: 'Cash Position Report', description: 'Real-time cash balance across all bank accounts and currencies' },
        { name: 'Outstanding Items Report', description: 'Uncleared checks, deposits in transit, and timing differences' },
        { name: 'Bank Transaction Listing', description: 'Detailed transaction history per bank account for any period' },
        { name: 'Bank Fee Analysis', description: 'Breaks down bank charges, wire fees, and service charges over time' },
        { name: 'Interbank Transfer Log', description: 'History of all transfers between company bank accounts' },
      ]}
      tabs={['Reconciliation Summary', 'Cash Position', 'Outstanding Items', 'Transactions', 'Bank Fees']}
      features={['Bank reconciliation status dashboard', 'Multi-account cash position view', 'Outstanding checks and deposits in transit', 'Bank fee categorization and trend', 'Interbank transfer audit trail', 'Foreign currency bank account reporting', 'Export for treasury management']}
      dataDisplayed={['Bank account names and balances', 'Reconciliation status per account', 'Outstanding checks count and total', 'Deposits in transit total', 'Bank service charges this period', 'Cash position in functional and foreign currency', 'Last reconciliation date per account']}
      userActions={['View bank reconciliation status', 'Analyze cash position', 'Review outstanding items', 'Export bank transaction history', 'Analyze bank fees', 'View interbank transfer log', 'Drill into unreconciled items']}
      relatedPages={[
        { label: 'Accountant Reports', href: '/reporting/reports-center/accountant-reports' },
        { label: 'Financial Statements', href: '/reporting/reports-center/financial-statements' },
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
      ]}
    />
  )
}

