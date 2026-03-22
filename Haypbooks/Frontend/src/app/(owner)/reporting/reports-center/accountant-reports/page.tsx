'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Accountant Reports'
      module='REPORTING'
      breadcrumb='Reporting / Reports Center / Accountant Reports'
      purpose='A curated collection of reports tailored to accounting professionals, including trial balance, general ledger, account reconciliation schedules, journal entry listings, and audit support reports. Provides the detailed transactional data needed for month-end close and audit preparation.'
      components={[
        { name: 'Trial Balance Report', description: 'Lists all accounts with debit and credit balances confirming the ledger is in balance' },
        { name: 'General Ledger Detail', description: 'Full transaction-level detail for every account over a selected period' },
        { name: 'Account Reconciliation Schedule', description: 'Reconciliation status and supporting schedules per account' },
        { name: 'Journal Entry Listing', description: 'Complete journal entry log with entry date, reference, lines, and approver' },
        { name: 'Adjustment Memo Report', description: 'Tracks manual adjustments with purpose, approver, and period' },
        { name: 'Inter-Company Transaction Report', description: 'Lists all inter-entity transactions for elimination review' },
      ]}
      tabs={['Trial Balance', 'General Ledger', 'Journal Entries', 'Reconciliation', 'Adjustments']}
      features={['Trial balance with debit/credit validation', 'Full general ledger with transaction drill-down', 'Journal entry listing with approval audit trail', 'Account reconciliation status tracking', 'Adjustment memo documentation', 'Inter-company transaction detail', 'Export for external auditor package']}
      dataDisplayed={['Account names and codes', 'Period debit and credit totals', 'Ending account balances', 'Journal entry references and descriptions', 'Preparer and approver names', 'Reconciliation status per account', 'Adjustment amounts and reasons']}
      userActions={['Generate trial balance', 'View general ledger by account', 'Review journal entry listing', 'Check account reconciliation status', 'Export auditor report package', 'Filter by period and account', 'Drill down from trial balance to transactions']}
      relatedPages={[
        { label: 'Financial Statements', href: '/reporting/reports-center/financial-statements' },
        { label: 'Standard Reports', href: '/reporting/standard-reports' },
        { label: 'Saved Views', href: '/reporting/saved-views' },
      ]}
    />
  )
}

