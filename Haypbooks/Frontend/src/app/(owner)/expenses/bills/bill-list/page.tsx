'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Bills"
      module="EXPENSES"
      breadcrumb="Expenses / Bills / Bill List"
      purpose="Bills is the vendor invoice management hub — where all incoming vendor invoices are entered, reviewed, approved, and tracked to payment. Each bill records the vendor, invoice date, due date, invoice number, line items, GL account coding, applicable taxes, department allocation, and approval status. Bills drive the AP balance and feed into the payment workflow. Three-way matching against POs and goods receipts is performed here before bills are approved for payment."
      components={[
        { name: 'Bills List', description: 'All bills with bill number, vendor, bill date, due date, total amount, amount paid, balance due, and status (Draft/Pending/Approved/Paid).' },
        { name: 'Bill Entry Form', description: 'Enter or edit a bill: vendor, bill date, due date, reference number, line items (description, amount, GL account, department, tax code).' },
        { name: '3-Way Match Panel', description: 'Link bill to PO and GRN for 3-way matching validation. Shows matched quantities and any discrepancies.' },
        { name: 'Payment Panel', description: 'Schedule or request payment from the bill screen.' },
        { name: 'Attachment', description: 'Attach scanned vendor invoice PDF to the bill record.' },
      ]}
      tabs={['All Bills', 'Draft', 'Pending Approval', 'Approved', 'Overdue', 'Paid']}
      features={[
        'Complete vendor invoice entry and management',
        '3-way matching with PO and GRN',
        'Bill approval workflow',
        'PDF invoice attachment',
        'Direct payment scheduling from bill',
        'Recurring bill support',
        'Batch vendor payment selection from bill list',
      ]}
      dataDisplayed={[
        'All bills with status, vendor, and amounts',
        'Bills due this week and overdue',
        'Unmatched or disputed bills',
        'Total AP balance across all open bills',
        'Approval status per bill',
        'Payment history per bill',
      ]}
      userActions={[
        'Enter a new vendor bill',
        'Upload and attach vendor invoice PDF',
        'Match bill to PO and GRN',
        'Submit bill for approval',
        'Approve a bill for payment',
        'Schedule or request payment of a bill',
        'Search and filter bills by vendor or date',
        'Export bill list to Excel',
      ]}
      relatedPages={[
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'Purchase Orders', href: '/expenses/purchase-orders/po-list' },
        { label: 'Vendor Payments', href: '/banking-cash/payments/vendor-payments' },
        { label: 'AP Aging', href: '/reporting/reports-center/ap-aging' },
      ]}
    />
  )
}

