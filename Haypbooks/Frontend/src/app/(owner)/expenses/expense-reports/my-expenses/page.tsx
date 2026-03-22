'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="My Expenses"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Reports / My Expenses"
      purpose="My Expenses is the employee-facing expense submission page. Employees record out-of-pocket business expenses (meals, travel, supplies purchased personally) for reimbursement. Each expense entry has a date, merchant, amount, category, purpose, receipt, and GL account. Expenses are grouped into expense reports submitted for manager approval. Upon approval and processing, the reimbursement is paid to the employee via the payroll or AP module."
      components={[
        { name: 'My Expense List', description: 'Current and past expense submissions for the logged-in employee with amount, status, and reimbursement date.' },
        { name: 'Expense Entry Form', description: 'Enter a single expense: date, merchant, amount, currency, category, purpose, payment method, and GL account.' },
        { name: 'Receipt Capture', description: 'Photo or PDF receipt attachment to each expense entry. OCR auto-fills merchant and amount from receipt image.' },
        { name: 'Expense Report Builder', description: 'Group individual expenses into an expense report (trip or period-based), add cover memo, and submit for approval.' },
        { name: 'Mileage Calculator', description: 'Enter distance and vehicle type; system calculates reimbursement amount based on configured rate per km.' },
      ]}
      tabs={['My Expenses', 'Create Expense', 'Expense Reports', 'Mileage', 'Reimbursements']}
      features={[
        'Employee expense entry with receipt capture',
        'OCR receipt scanning for auto-fill',
        'Expense report submission workflow',
        'Mileage reimbursement calculator',
        'Out-of-policy expense flagging',
        'Multi-currency expense entry',
        'Reimbursement status tracking',
      ]}
      dataDisplayed={[
        'All my expense submissions with status',
        'Pending approval expense reports',
        'Approved and reimbursed expenses',
        'My mileage log YTD',
        'Expenses by category breakdown',
      ]}
      userActions={[
        'Submit a new expense',
        'Attach receipt photo or PDF',
        'Create and submit an expense report',
        'Enter mileage expense',
        'Check reimbursement status',
        'Edit a draft expense',
        'Recall an expense report not yet approved',
      ]}
      relatedPages={[
        { label: 'Expense Approval', href: '/expenses/expense-reports/expense-approval' },
        { label: 'Mileage', href: '/expenses/expense-reports/mileage' },
        { label: 'Corporate Cards', href: '/expenses/expense-reports/corporate-cards' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
      ]}
    />
  )
}

