'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bank Accounts"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Accounts / Bank Accounts"
      purpose="Bank Accounts is the registry of all company bank accounts connected to the accounting system. Each account record stores the bank name, account number (masked), account type (current, savings, payroll, USD foreign currency), currency, opening balance, current balance, and GL account mapping. Bank accounts serve as the connected source for bank feed imports, reconciliation, and payment processing."
      components={[
        { name: 'Account List', description: 'All connected bank accounts with bank name, last 4 digits, account type, currency, and current balance.' },
        { name: 'Account Detail', description: 'Full account profile: bank name, branch, SWIFT/routing, account type, currency, GL mapping, and feed connection status.' },
        { name: 'Connect Bank Feed', description: 'Setup wizard for connecting a bank account to automated feed via direct integration or CSV import template.' },
        { name: 'Transaction History', description: 'Recent transactions for the account imported from bank feed or manually entered.' },
        { name: 'Account Summary', description: 'Total balance across all accounts in base currency with FX conversion.' },
      ]}
      tabs={['All Accounts', 'Current Accounts', 'Savings', 'Foreign Currency', 'Payroll Accounts']}
      features={[
        'Multi-bank, multi-currency account registry',
        'Bank feed connection management',
        'GL account mapping per bank account',
        'Total cash position across all accounts',
        'Account reconciliation status indicator',
        'Inactive/dormant account management',
      ]}
      dataDisplayed={[
        'All bank accounts with current balances',
        'Bank feed connection status',
        'Last reconciliation date',
        'Unreconciled transaction count',
        'Total cash in base and foreign currencies',
      ]}
      userActions={[
        'Add a new bank account to the registry',
        'Connect a bank feed to an account',
        'Update bank account details',
        'View transactions for an account',
        'Navigate to reconcile an account',
        'Mark account as inactive',
      ]}
      relatedPages={[
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
        { label: 'Reconcile', href: '/banking-cash/reconciliation/reconcile' },
        { label: 'Feed Connections', href: '/banking-cash/bank-feeds/feed-connections' },
        { label: 'Treasury Overview', href: '/banking-cash/treasury/treasury-overview' },
      ]}
    />
  )
}

