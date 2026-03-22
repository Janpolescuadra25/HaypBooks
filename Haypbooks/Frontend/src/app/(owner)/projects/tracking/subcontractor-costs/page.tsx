'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Subcontractor Costs'
      module='PROJECTS'
      breadcrumb='Projects / Tracking / Subcontractor Costs'
      purpose='Tracks all subcontractor invoices, purchase orders, and committed costs on projects. Provides visibility into subcontractor spending against budget, manages retention, and ensures subcontractor costs are accurately reflected in project financials and billing.'
      components={[
        { name: 'Subcontractor Cost Log', description: 'List of all subcontractor invoices and POs linked to projects' },
        { name: 'Committed Cost Tracker', description: 'Tracks open POs and contract amounts not yet invoiced' },
        { name: 'Subcontractor Retention Manager', description: 'Manages retention amounts withheld from subcontractor payments' },
        { name: 'PO vs. Invoice Reconciliation', description: 'Compares purchase order amounts to invoices received per subcontractor' },
        { name: 'Subcontractor Markup Tool', description: 'Applies agreed markup to subcontractor costs for client billing' },
      ]}
      tabs={['All Subcontractors', 'Committed Costs', 'Invoiced Costs', 'Retention']}
      features={['Committed cost tracking from POs', 'Subcontractor retention management', 'PO-to-invoice matching and reconciliation', 'Cost markup for client billing', 'Subcontractor spend by project and budget category', 'Certified payment application processing', 'Export subcontractor cost report']}
      dataDisplayed={['Subcontractor name', 'PO number and amount', 'Invoices received vs. PO', 'Committed but uninvoiced balance', 'Retention withheld amount', 'Markup percentage and billed amount', 'Budget category assigned to']}
      userActions={['Record subcontractor PO', 'Log subcontractor invoice', 'Match invoice to PO', 'Apply markup for billing', 'Manage retention release', 'Approve subcontractor payment', 'Export subcontractor cost report']}
      relatedPages={[
        { label: 'Materials Usage', href: '/projects/tracking/materials-usage' },
        { label: 'Project Expenses', href: '/projects/tracking/project-expenses' },
        { label: 'Budget vs. Actual', href: '/projects/financials/budget-vs-actual' },
      ]}
    />
  )
}

