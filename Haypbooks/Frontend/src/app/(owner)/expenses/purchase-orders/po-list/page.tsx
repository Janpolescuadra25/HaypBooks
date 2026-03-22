'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Purchase Orders"
      module="EXPENSES"
      breadcrumb="Expenses / Purchase Orders / PO List"
      purpose="Purchase Orders manages the formal pre-purchase authorization workflow — creating a PO to authorize spending before a bill is received. A PO is created, approved, sent to the vendor, and then matched against the vendor's invoice when it arrives (3-way matching: PO → receipt → invoice). This prevents unauthorized purchases, enforces budget controls, and creates a paper trail for all procurement activity. Open POs appear in the accruals review at month-end."
      components={[
        { name: 'PO List', description: 'All purchase orders with PO number, vendor, date, total amount, received amount, billed amount, and status (Draft/Approved/Partial/Complete/Cancelled).' },
        { name: 'PO Editor', description: 'Create/edit a PO: select vendor, add line items (description, qty, unit price, GL account, department), set delivery date.' },
        { name: 'PO Approval Workflow', description: 'PO approval flow: Draft → Submitted → Approved → Sent to Vendor. Approvers review and authorize spending.' },
        { name: 'Receiving Screen', description: 'Record goods/services received against a PO line by line — used for 3-way matching.' },
        { name: 'PO Status Tracking', description: 'See which PO lines are fully received, partially received, or awaiting delivery.' },
      ]}
      tabs={['All POs', 'Draft', 'Pending Approval', 'Open', 'Received', 'Completed']}
      features={[
        'Pre-approved purchase commitment tracking',
        'Multi-level PO approval workflow',
        'Goods receipt recording for 3-way matching',
        'Budget encumbrance tracking for open POs',
        'PO-to-bill matching when invoice arrives',
        'PO accrual for month-end (received not yet billed)',
        'Export PO list for vendor negotiation review',
      ]}
      dataDisplayed={[
        'All POs with status, vendor, and amount',
        'PO lines received vs. total ordered',
        'Open PO commitments (encumbrances)',
        'Total spend committed but not yet billed',
        'PO approval status and approver',
      ]}
      userActions={[
        'Create a new purchase order',
        'Submit PO for approval',
        'Approve or reject a PO',
        'Email PO to vendor',
        'Record goods receipt against PO',
        'Match incoming vendor invoice to PO',
        'Cancel an outstanding PO',
        'Export PO list to Excel',
      ]}
      relatedPages={[
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'PO Approval', href: '/expenses/purchase-orders/po-approval' },
        { label: 'AP Aging', href: '/reporting/reports-center/ap-aging' },
      ]}
    />
  )
}

