'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Feed History"
      module="BANKING & CASH"
      breadcrumb="Banking & Cash / Bank Feeds / Feed History"
      purpose="Feed History is the audit log of all bank feed synchronization events and transaction imports. It shows every sync with the timestamp, bank account, number of transactions imported, any duplicates detected and skipped, and any errors encountered. Users can drill into a specific import to see which transactions were added. Feed History is used for troubleshooting import issues and verifying that all bank transactions have been captured."
      components={[
        { name: 'Sync History Table', description: 'Row per sync event: timestamp, bank account, import method, transactions imported, duplicates skipped, and status.' },
        { name: 'Import Detail View', description: 'List of all transactions imported in a specific sync with amounts, dates, and descriptions.' },
        { name: 'Error Log', description: 'Any failed syncs with error message and troubleshooting steps.' },
        { name: 'Manual Upload Log', description: 'History of manually uploaded CSV bank statements with file name, upload date, and transaction count.' },
      ]}
      tabs={['All Imports', 'Manual Uploads', 'Errors', 'By Account']}
      features={[
        'Complete import history per bank account',
        'Transaction drill-down per import event',
        'Duplicate detection log',
        'Error history for troubleshooting',
        'Filter by date range or bank account',
        'Export import log for IT reconciliation',
      ]}
      dataDisplayed={[
        'All sync events with timestamp and status',
        'Transactions imported per sync',
        'Duplicates detected and skipped',
        'Error messages from failed syncs',
        'Manual upload history',
      ]}
      userActions={[
        'View detail of a specific import',
        'Investigate a failed sync',
        'Re-trigger a failed import',
        'Export feed history log',
        'Filter by date range or bank account',
      ]}
      relatedPages={[
        { label: 'Feed Connections', href: '/banking-cash/bank-feeds/feed-connections' },
        { label: 'Bank Transactions', href: '/banking-cash/transactions/bank-transactions' },
        { label: 'System Health', href: '/automation/monitoring/system-health' },
      ]}
    />
  )
}

