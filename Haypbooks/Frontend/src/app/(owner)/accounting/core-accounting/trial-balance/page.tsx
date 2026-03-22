'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Trial Balance"
      module="ACCOUNTING"
      breadcrumb="Accounting / Core Accounting / Trial Balance"
      purpose="The Trial Balance page displays the aggregate debit and credit balances for every account in the chart of accounts as of a selected date. It is the foundational check of double-entry integrity, confirming that total debits equal total credits. It supports both the unadjusted trial balance (pre-adjustments) and the adjusted trial balance (post-adjusting entries) and feeds into the financial statement generation process."
      components={[
        { name: 'Trial Balance Grid', description: 'Account code, account name, account type, debit balance, and credit balance for every account with a non-zero balance.' },
        { name: 'Totals Footer', description: 'Grand total debits and credits row with clear pass/fail indicator for whether the trial balance is in balance.' },
        { name: 'Balance Filters', description: 'Toggle between Unadjusted, Adjusted, and Post-Closing trial balance views.' },
        { name: 'Out-of-Balance Alerts', description: 'Warning banner with amount of discrepancy if debits do not equal credits, with drill-down to find the offending entries.' },
      ]}
      tabs={['Unadjusted', 'Adjusted', 'Post-Closing']}
      features={[
        'Real-time balance sheet debit/credit check',
        'Three trial balance view types (unadjusted, adjusted, post-closing)',
        'Drill through from any account to its detailed transactions',
        'Out-of-balance alert with discrepancy amount',
        'Export to Excel/CSV for working papers',
        'Compare trial balance across two periods',
      ]}
      dataDisplayed={[
        'All accounts with non-zero balances',
        'Debit and credit balances per account',
        'Account codes and types',
        'Total debit and credit columns',
        'Balance check status (in balance / out of balance)',
      ]}
      userActions={[
        'Select reporting date for trial balance',
        'Toggle between unadjusted and adjusted views',
        'Drill through to account transaction detail',
        'Export trial balance to Excel',
        'Print trial balance for audit workpapers',
      ]}
      relatedPages={[
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Chart of Accounts', href: '/accounting/core-accounting/chart-of-accounts' },
        { label: 'Balance Sheet', href: '/reporting/reports-center/financial-statements/balance-sheet' },
        { label: 'P&L Report', href: '/reporting/reports-center/financial-statements/profit-and-loss' },
      ]}
    />
  )
}

