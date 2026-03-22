'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Write-Offs"
      module="SALES"
      breadcrumb="Sales / Collections / Write-Offs"
      purpose="Write-Offs handles the process of recognizing uncollectible receivables as bad debt expense. When all collection efforts have been exhausted and a receivable balance is determined to be unrecoverable, it is written off — the AR balance is removed and the amount is charged to bad debt expense in the P&L. The write-off requires authorization, is documented with reasons and evidence, and creates the necessary journal entries. Recoveries of previously written-off amounts are also recorded here."
      components={[
        { name: 'Write-Off Candidates', description: 'Receivables flagged for potential write-off: aged 90+ days with no payment activity and documented collection effort.' },
        { name: 'Write-Off Authorization Form', description: 'Request write-off: select invoice(s), enter reason, attach supporting documentation, and submit for approval.' },
        { name: 'Authorization Workflow', description: 'Multi-level approval based on write-off amount (e.g., accounts manager → CFO for above threshold).' },
        { name: 'Write-Off Journal', description: 'Automatic journal entries posted upon approval: DR Bad Debt Expense, CR Accounts Receivable.' },
        { name: 'Recovery Recording', description: 'Record unexpected recovery of a written-off receivable: reverses the write-off and records the cash receipt.' },
        { name: 'Write-Off Register', description: 'Archive of all write-offs with customer, amount, date, reason, and authorization trail.' },
      ]}
      tabs={['Candidates', 'Pending Approval', 'Approved Write-Offs', 'Recoveries', 'Register']}
      features={[
        'Structured write-off authorization workflow',
        'Required documentation for write-off approval',
        'Automatic bad debt expense journal entries',
        'Recovery recording for previously written-off amounts',
        'Write-off register for disclosure and audit',
        'Allowance for doubtful accounts support',
        'Report of write-offs for management and tax purposes',
      ]}
      dataDisplayed={[
        'Receivables eligible for write-off consideration',
        'Write-off requests pending approval',
        'Approved write-offs with authorization chain',
        'Total write-offs posted in current period.',
        'Recoveries received on written-off accounts',
      ]}
      userActions={[
        'Submit a write-off request for a receivable',
        'Attach collection effort documentation',
        'Approve or reject a write-off request',
        'Post approved write-off to GL',
        'Record recovery of a written-off amount',
        'Export write-off register for tax or audit',
      ]}
      relatedPages={[
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
        { label: 'AR Aging', href: '/sales/collections/aging-report' },
        { label: 'Journal Entries', href: '/accounting/core-accounting/journal-entries' },
        { label: 'Customer List', href: '/sales/customers/customer-list' },
      ]}
    />
  )
}

