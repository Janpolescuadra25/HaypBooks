'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxClosingEntriesPage() {
  return (
    <PageDocumentation
      title="Tax Closing Entries"
      module="TAXES"
      breadcrumb="Taxes / Year-End / Tax Closing Entries"
      purpose="Tax Closing Entries manages the final accounting entries required to close out all temporary tax accounts at year-end — transferring balances from tax expense accounts to retained earnings and resetting estimated tax accounts to zero. This workflow ensures that the balance sheet reflects only the net tax liability or asset position, and that income statement tax accounts are properly zeroed for the new fiscal year. The closing process follows the financial year-end close workflow."
      components={[
        { name: 'Closing Entry Checklist', description: 'Step-by-step checklist of all required tax closing entries with status indicator per step.' },
        { name: 'Auto-Generate Closing Entries', description: 'System-generated closing entries based on current tax account balances.' },
        { name: 'Review & Edit Screen', description: 'Editable view of generated entries before posting to allow manual corrections.' },
        { name: 'Post Entries Action', description: 'Final post button that writes all approved closing entries to the general ledger.' },
        { name: 'Closing Confirmation Report', description: 'Post-closing report confirming all tax accounts have been properly closed and their resulting balances.' },
      ]}
      tabs={['Closing Checklist', 'Generated Entries', 'Post & Confirm', 'Closing Report']}
      features={[
        'Checklist of all year-end tax closing steps',
        'Auto-generate standard closing entries from account balances',
        'Review and edit generated entries before posting',
        'Post all closing entries in a single action',
        'Generate post-closing confirmation report',
        'Prevent re-running if closing has already been completed',
      ]}
      dataDisplayed={[
        'Tax accounts with pre-closing balances',
        'Generated closing entry debit and credit lines',
        'Post-closing account balances',
        'Closing date and user',
        'Checklist step completion status',
      ]}
      userActions={[
        'Review auto-generated closing entries',
        'Edit entries before posting if needed',
        'Post all closing entries to GL',
        'Generate post-closing confirmation report',
        'Review and sign off closing checklist',
      ]}
    />
  )
}

