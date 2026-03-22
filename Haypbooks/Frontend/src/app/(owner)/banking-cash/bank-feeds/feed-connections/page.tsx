'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Feed Connections"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Feeds / Feed Connections"
      purpose="Feed Connections manages the setup and maintenance of direct bank data connections — the automated import channels that bring bank transactions into the system daily without manual data entry. Supported connection methods include direct bank API integration (for partner banks), Open Banking API connections, and scheduled CSV file import templates. Each connected account shows its last sync time, transaction count, and connection health status."
      components={[
        { name: 'Connection List', description: 'All connected bank accounts with connection type (API/CSV), last sync timestamp, sync frequency, and status (Active/Error/Disconnected).' },
        { name: 'New Connection Wizard', description: 'Step-by-step wizard to connect a new bank account: select bank, choose connection method, authorize, and map to GL account.' },
        { name: 'Connection Health Monitor', description: 'Status indicators per connection with last successful sync, failed sync count, and error messages.' },
        { name: 'CSV Template Manager', description: 'Download bank-specific CSV import templates and configure column mapping for manual upload.' },
        { name: 'Sync Log', description: 'History of all sync events per connection with transactions imported per sync and any errors.' },
      ]}
      tabs={['Active Connections', 'Setup New Connection', 'CSV Templates', 'Sync History']}
      features={[
        'Direct bank API integration for automated transaction import',
        'Open Banking API connection support',
        'CSV template-based import for non-integrated banks',
        'Connection health monitoring with error alerts',
        'Configurable sync frequency (daily, on-demand)',
        'Duplicate transaction detection on import',
        'Multi-entity connection management',
      ]}
      dataDisplayed={[
        'All bank connections with status',
        'Last sync time and next scheduled sync',
        'Transactions imported per sync',
        'Error messages for failed connections',
        'Available bank integration partners',
      ]}
      userActions={[
        'Connect a new bank account via API',
        'Upload a CSV bank statement',
        'Re-authorize an expired connection',
        'Manually trigger a sync',
        'Download CSV import template',
        'Disconnect a bank feed',
        'Troubleshoot a failed sync',
      ]}
      relatedPages={[
        { label: 'Bank Accounts', href: '/banking-cash/accounts/bank-accounts' },
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
        { label: 'Matching Rules', href: '/banking-cash/bank-feeds/matching-rules' },
        { label: 'Reconcile', href: '/banking-cash/reconciliation/reconcile' },
      ]}
    />
  )
}

