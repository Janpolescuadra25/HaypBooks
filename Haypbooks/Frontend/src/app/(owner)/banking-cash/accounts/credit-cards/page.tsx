'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Credit Cards"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Accounts / Credit Cards"
      purpose="Credit Cards manages all business credit card accounts — corporate cards, company credit cards, and charge cards used for business expenses. Each card account is tracked for current balance, credit limit, available credit, statement date, and payment due date. Card transactions are imported via bank feeds or CSV uploads and require coding (GL account assignment) before reconciliation. Credit card statements are reconciled monthly."
      components={[
        { name: 'Card Account List', description: 'All credit card accounts with card type, bank issuer, last 4 digits, credit limit, current balance, available credit, and payment due date.' },
        { name: 'Card Transaction Log', description: 'All transactions imported from card statements with merchant, date, amount, and coding status.' },
        { name: 'Statement Reconciliation', description: 'Match imported transactions against the card statement and code each transaction to the GL.' },
        { name: 'Payment Recording', description: 'Record credit card payment (bank transfer to card) to clear the card balance.' },
        { name: 'Cardholder Summary', description: 'For multi-card accounts, show spending by individual cardholder.' },
      ]}
      tabs={['Card Accounts', 'Transactions', 'Pending Coding', 'Statements', 'Payments']}
      features={[
        'Multi-card account tracking for all business credit cards',
        'Bank feed or CSV import for card transactions',
        'Transaction coding to GL accounts and categories',
        'Monthly statement reconciliation workflow',
        'Credit utilization monitoring per card',
        'Payment due date alerts',
        'Receipt attachment per card transaction',
      ]}
      dataDisplayed={[
        'Card accounts with current balances and limits',
        'Available credit per card',
        'Unreconciled/uncoded transactions',
        'Payment due dates',
        'Monthly spending by card and category',
        'Credit utilization percentage',
      ]}
      userActions={[
        'Add a new credit card account',
        'Import card transactions from statement CSV',
        'Code a card transaction to GL',
        'Attach receipt to a card transaction',
        'Record credit card payment',
        'Reconcile monthly statement',
        'View cardholder spending breakdown',
      ]}
      relatedPages={[
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Expense Reports', href: '/expenses/expense-reports/my-expenses' },
        { label: 'Corporate Cards', href: '/expenses/expense-reports/corporate-cards' },
        { label: 'Reconcile', href: '/banking-cash/reconciliation/reconcile' },
      ]}
    />
  )
}

