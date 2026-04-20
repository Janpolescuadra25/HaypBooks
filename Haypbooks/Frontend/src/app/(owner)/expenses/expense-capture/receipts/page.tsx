'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Receipts"
      module="EXPENSES"
      breadcrumb="Expense Management / Expenses / Receipts"
      purpose="Receipts centralizes uploaded receipt images and links each document to an expense, reimbursement, or mileage claim so finance teams can verify spend quickly."
      components={[
        { name: 'Receipt Inbox', description: 'List of uploaded receipts with status, amount, vendor/merchant, and matching confidence.' },
        { name: 'Preview Panel', description: 'Image and OCR preview to validate date, amount, merchant, and tax details.' },
        { name: 'Match Controls', description: 'Actions to match receipts to existing transactions or create a draft expense entry.' },
      ]}
      tabs={['All Receipts', 'Unmatched', 'Matched', 'Needs Review']}
      features={[
        'Upload and capture receipt images',
        'OCR-assisted extraction for key fields',
        'Manual review and correction workflow',
        'Link receipts to expenses and reimbursements',
      ]}
      dataDisplayed={[
        'Upload timestamp and submitter',
        'Merchant/vendor name',
        'Receipt date and amount',
        'Match status and linked transaction',
      ]}
      userActions={[
        'Upload receipt image',
        'Review extracted receipt details',
        'Match to an existing transaction',
        'Create a new expense from receipt',
      ]}
      relatedPages={[
        { label: 'Expenses', href: '/expenses/expense-capture/expenses' },
        { label: 'Reimbursements', href: '/expenses/expense-capture/reimbursements' },
      ]}
    />
  )
}

