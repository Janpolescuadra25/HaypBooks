'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="PO Receiving"
      module="EXPENSES"
      breadcrumb="Expenses / Purchase Orders / PO Receiving"
      purpose="PO Receiving is the goods and services receipt recording screen. When physical goods are delivered or services are confirmed as delivered, the receiving team records what was actually received against the purchase order line items. This creates a Goods Receipt Note (GRN) — the third document in the 3-way matching process (PO → GRN → Invoice). Partial receipts are supported. Month-end accruals for received-not-yet-invoiced (RNYI) are automatically available based on receiving records."
      components={[
        { name: 'Open POs Awaiting Receipt', description: 'All approved POs with delivered/received status pending confirmation.' },
        { name: 'Receiving Entry Form', description: 'For each open PO: confirm received quantities per line item, enter delivery date, delivery note reference, and any discrepancies.' },
        { name: 'GRN Summary', description: 'Goods Receipt Note summary before posting: PO reference, vendor, received lines, quantities, and values.' },
        { name: 'Discrepancy Log', description: 'Record items received with discrepancies (damaged, short delivery) with description and photos.' },
        { name: 'RNYI Accrual Summary', description: 'Report of all received-not-yet-invoiced items for month-end accrual purposes.' },
      ]}
      tabs={['Receive Against PO', 'Receipt History', 'Discrepancies', 'RNYI Accruals']}
      features={[
        'Goods receipt recording against approved PO',
        'Partial receipt support',
        'Discrepancy documentation',
        'GRN generation for audit trail',
        'Received-not-yet-invoiced (RNYI) accrual report',
        'Link from GRN to incoming vendor invoice for 3-way match',
      ]}
      dataDisplayed={[
        'Open POs awaiting receipt',
        'Expected quantities vs. received quantities',
        'RNYI amounts per PO at any point in time',
        'Discrepancy records',
        'Receipt history with GRN references',
      ]}
      userActions={[
        'Record goods receipt against a PO',
        'Enter received quantities per line',
        'Document any delivery discrepancy',
        'Post the goods receipt note',
        'View RNYI accrual report for month-end',
        'View receipt history for a PO',
      ]}
      relatedPages={[
        { label: 'Purchase Orders', href: '/expenses/purchase-orders/po-list' },
        { label: 'Bills', href: '/expenses/bills/bill-list' },
        { label: 'Period Close', href: '/accounting/period-close/close-checklist' },
      ]}
    />
  )
}

