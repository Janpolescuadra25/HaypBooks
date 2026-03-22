'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Cost Adjustments"
      module="INVENTORY"
      breadcrumb="Inventory / Costing / Cost Adjustments"
      purpose="Cost Adjustments manages corrections to inventory item costs — when a vendor later adjusts the invoice price, when an error is found in the original receipt cost, or when damage reduces an item's carrying value. Each cost adjustment creates a corresponding journal entry to adjust the inventory asset account and the COGS or write-down expense account. All adjustments require a reason and are subject to authorization to maintain cost integrity."
      components={[
        { name: 'Adjustment List', description: 'History of all cost adjustments posted: item, original cost, adjusted cost, quantity affected, amount, reason, and authorization.' },
        { name: 'New Adjustment Form', description: 'Record a cost adjustment: select item, batch (for FIFO), original cost, new cost, quantity affected, reason, and reference.' },
        { name: 'Approval Workflow', description: 'Cost adjustments above a threshold require manager or finance controller approval before posting.' },
        { name: 'GL Impact Preview', description: 'Before posting, show the journal entry that will be created: DR/CR accounts, amounts.' },
      ]}
      tabs={['Adjustment History', 'New Adjustment', 'Pending Approval']}
      features={[
        'Structured cost adjustment workflow',
        'GL journal entry auto-generated on adjustment',
        'Approval required for material adjustments',
        'Reason code tracking for audit',
        'FIFO batch-specific adjustment support',
        'Full audit trail of all cost changes',
      ]}
      dataDisplayed={[
        'All cost adjustments with amounts and reasons',
        'Net impact on inventory value per period',
        'Pending adjustments awaiting approval',
        'GL entry preview before posting',
      ]}
      userActions={[
        'Create a new cost adjustment',
        'Submit for approval above threshold',
        'Approve or reject cost adjustment',
        'Post approved adjustment',
        'View GL journal entry for adjustment',
        'Export adjustment history',
      ]}
      relatedPages={[
        { label: 'Costing Method', href: '/inventory/costing/costing-method' },
        { label: 'Inventory Valuation', href: '/inventory/reports/inventory-valuation' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
      ]}
    />
  )
}

