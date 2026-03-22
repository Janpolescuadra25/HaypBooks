'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Vendor Payments"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Payments / Vendor Payments"
      purpose="Vendor Payments is the execution module for paying outstanding vendor bills. Users select bills due for payment, choose the payment method (bank transfer, check, online payment), specify the payment date and bank account to pay from, and generate the payment. Upon posting, the payment reduces the AP balance, records the bank outflow, and can generate remittance advice email notifications to vendors. Supports individual payments and batch payments."
      components={[
        { name: 'Bills Due for Payment', description: 'Queue of all open bills with due date, vendor, amount, early payment discount (if applicable), and days overdue.' },
        { name: 'Payment Selection Panel', description: 'Checkbox-select bills to include in the payment run with real-time total calculation.' },
        { name: 'Payment Method Selector', description: 'Choose payment method: bank transfer, check, online payment gateway. Enter bank account to pay from.' },
        { name: 'Payment Confirmation Summary', description: 'Review total payment amount, number of bills, and per-vendor breakdown before posting.' },
        { name: 'Payment History', description: 'Archive of all payments made with date, vendor, amount, payment method, and bank reference.' },
      ]}
      tabs={['Bills Due', 'Scheduled Payments', 'Payment Entry', 'Payment History']}
      features={[
        'Individual and batch payment creation',
        'Early payment discount application',
        'Multiple payment methods: bank transfer, check, online',
        'Remittance advice generation and email to vendor',
        'Partial payment support',
        'AP balance auto-update upon payment posting',
        'Duplicate payment detection',
      ]}
      dataDisplayed={[
        'Open bills with due dates and amounts',
        'Overdue bills with days past due',
        'Early payment discount opportunities',
        'Total AP due in next 7/14/30 days',
        'Payment history by vendor',
        'Payment method and bank reference per payment',
      ]}
      userActions={[
        'Select bills for immediate payment',
        'Apply early payment discount',
        'Choose payment method and bank account',
        'Schedule a future payment date',
        'Confirm and post payment batch',
        'Send remittance advice to vendor',
        'Void a payment',
      ]}
      relatedPages={[
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Batch Payments', href: '/banking-cash/payments/batch-payments' },
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'AP Aging', href: '/reporting/reports-center/ap-aging' },
      ]}
    />
  )
}

