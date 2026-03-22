'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Corporate Cards"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Reports / Corporate Cards"
      purpose="Corporate Cards manages the expense coding and reconciliation for company-issued credit cards held by individual employees. Unlike personal out-of-pocket expenses that require reimbursement, corporate card transactions are direct company expenses — employees must justify and categorize each card transaction. This page shows each cardholder their assigned card transactions, requires them to code each transaction to a GL account and purpose, and attach a receipt before the monthly statement is submitted."
      components={[
        { name: 'My Card Transactions', description: 'All transactions on the assigned corporate card since the last statement: merchant, date, amount, and coding status.' },
        { name: 'Transaction Coding Form', description: 'For each transaction: assign GL account, department, purpose/project, and attach receipt.' },
        { name: 'Statement Submission', description: 'At month-end, submit the coded card statement for manager review and approval.' },
        { name: 'Manager Review Dashboard', description: 'Manager view of all corporate card submissions with coding review, receipts, and approval action.' },
        { name: 'Card Summary by Holder', description: 'Spend summary by individual cardholder and category for the month.' },
      ]}
      tabs={['My Card Transactions', 'Pending Coding', 'Submit Statement', 'Manager Review', 'Spend Reports']}
      features={[
        'Per-cardholder transaction visibility and coding',
        'Receipt attachment per transaction',
        'Monthly statement submission and approval workflow',
        'Automated import from credit card feed',
        'Out-of-policy transaction flagging',
        'Spend analysis by cardholder and category',
        'Late submission reminders',
      ]}
      dataDisplayed={[
        'All card transactions with coding status',
        'Uncoded transactions requiring action',
        'Spend by GL account and category',
        'Corporate card balance and credit limit',
        'Statement submission status per cardholder',
      ]}
      userActions={[
        'Code a card transaction',
        'Attach receipt to transaction',
        'Split a transaction across multiple GL accounts',
        'Submit monthly statement',
        'Approve a submitted card statement',
        'Flag a transaction as personal (reimbursement to company)',
        'View spend analysis',
      ]}
      relatedPages={[
        { label: 'My Expenses', href: '/expenses/expense-reports/my-expenses' },
        { label: 'Expense Approval', href: '/expenses/expense-reports/expense-approval' },
        { label: 'Credit Cards', href: '/banking-cash/accounts/credit-cards' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
      ]}
    />
  )
}

