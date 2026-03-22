'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxAdjustmentsPage() {
  return (
    <PageDocumentation
      title="Tax Adjustments"
      module="TAXES"
      breadcrumb="Taxes / Year-End / Tax Adjustments"
      purpose="Tax Adjustments is the workspace for recording year-end tax-related journal entries — including current tax provision, deferred tax movements, prior year adjustments, and any other entries needed to finalize the tax accounts for the period. This module ensures the books correctly reflect the company's tax position as at year-end before the financial statements are signed off. Each adjustment is supported by a memo explaining the basis for the entry."
      components={[
        { name: 'Adjustment Journal List', description: 'List of all year-end tax adjustment entries with description, amount, and posting status.' },
        { name: 'New Adjustment Form', description: 'Form to create a new tax adjustment journal entry with debit/credit accounts, amount, and memo.' },
        { name: 'Adjustment Categories', description: 'Preset adjustment categories: current tax provision, deferred tax, prior year, and other.' },
        { name: 'Supporting Document Upload', description: 'Attach supporting calculation spreadsheets or memos to each adjustment entry.' },
        { name: 'Approval Workflow', description: 'Submit adjustments for review and approval by the tax manager before posting.' },
      ]}
      tabs={['All Adjustments', 'Current Tax', 'Deferred Tax', 'Prior Year', 'Posted']}
      features={[
        'Record year-end tax provision and deferred tax journal entries',
        'Categorize adjustments by type for organized year-end review',
        'Attach supporting calculations to each adjustment',
        'Submit adjustments for tax manager approval',
        'Post approved adjustments to the general ledger',
        'Generate adjustment summary for external auditors',
      ]}
      dataDisplayed={[
        'Adjustment description and category',
        'Debit and credit accounts',
        'Adjustment amount',
        'Approval status and approver',
        'Supporting document attached',
      ]}
      userActions={[
        'Create a new tax adjustment entry',
        'Attach supporting documentation',
        'Submit for approval',
        'Approve or reject submitted adjustments',
        'Post approved adjustments to GL',
      ]}
    />
  )
}

