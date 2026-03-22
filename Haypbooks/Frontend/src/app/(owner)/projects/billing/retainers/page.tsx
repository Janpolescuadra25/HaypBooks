'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title='Project Retainers'
      module='PROJECTS'
      breadcrumb='Projects / Billing / Retainers'
      purpose='Manages prepaid retainer arrangements where clients pay in advance for project work or ongoing services. Tracks retainer balances, applies time and expense charges against the retainer, and alerts when top-up is required or balance falls below threshold.'
      components={[
        { name: 'Retainer Balance Dashboard', description: 'Overview cards showing active retainers, total held, and consumed balances' },
        { name: 'Retainer Account Ledger', description: 'Detailed transaction history of retainer deposits and drawdowns' },
        { name: 'Drawdown Application', description: 'Interface to apply billable time and expenses against retainer balance' },
        { name: 'Top-Up Request Generator', description: 'Creates invoices for retainer replenishment with client-facing payment instructions' },
        { name: 'Expiry and Threshold Alerts', description: 'Configurable notifications when retainer drops below minimum or approaches expiry' },
      ]}
      tabs={['Active Retainers', 'Ledger', 'Drawdown History', 'Replenishment']}
      features={['Multi-project retainer management', 'Automatic drawdown on time and expense posting', 'Retainer balance threshold alerts', 'Auto-replenishment invoice generation', 'Retainer refund processing', 'Detailed audit trail per drawdown', 'Multi-currency retainer support']}
      dataDisplayed={['Client name and project', 'Retainer amount originally received', 'Total drawdowns to date', 'Current available balance', 'Retainer expiry date (if applicable)', 'Minimum balance threshold', 'Last top-up date and amount']}
      userActions={['Set up new retainer arrangement', 'Record retainer receipt from client', 'Apply charges against retainer', 'Generate top-up invoice', 'Process retainer refund', 'View retainer ledger', 'Export retainer statement']}
      relatedPages={[
        { label: 'Project Billing', href: '/projects/billing/project-billing' },
        { label: 'Billable Review', href: '/projects/tracking/billable-review' },
        { label: 'Customer Statements', href: '/sales/billing/customer-statements' },
      ]}
    />
  )
}

