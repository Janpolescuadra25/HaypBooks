'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxReturnsPage() {
  return (
    <PageDocumentation
      title="Tax Returns"
      module="TAXES"
      breadcrumb="Taxes / Filing & Payments / Tax Returns"
      purpose="Tax Returns is the primary workspace for preparing, reviewing, and finalizing all periodic tax return filings. The module aggregates transaction data from across Haypbooks to pre-populate return schedules, then presents them in an editable format for final review before submission. Supported return types include quarterly VAT, monthly withholding, annual income tax, and other jurisdiction-specific forms."
      components={[
        { name: 'Return List', description: 'Table of all tax returns by type and period, with preparation status (draft, reviewed, filed, accepted).' },
        { name: 'Return Preparation Wizard', description: 'Step-by-step form to populate each section of a tax return from aggregated transaction data.' },
        { name: 'Data Pull Summary', description: 'Preview of all transactions included in the return with filtering to add or exclude specific entries.' },
        { name: 'Adjustments Input', description: 'Manual adjustment rows within the return for items not in the automated data pull.' },
        { name: 'Filing Action Panel', description: 'Final review screen with sign-off button and choice to e-file, download for manual filing, or save draft.' },
      ]}
      tabs={['All Returns', 'Draft', 'Ready to File', 'Filed', 'Accepted']}
      features={[
        'Prepare tax returns from aggregated transaction data',
        'Review and edit pre-populated return schedules',
        'Add manual adjustments to auto-populated return figures',
        'Submit return via e-filing or download for manual submission',
        'Track return status from draft to accepted',
        'Link filed returns to supporting transaction data',
      ]}
      dataDisplayed={[
        'Return type, tax period, and due date',
        'Pre-populated income, deductions, and tax computed',
        'Manual adjustments entered',
        'Filing status and reference number',
        'Tax due or refund amount',
      ]}
      userActions={[
        'Create a new tax return for any period',
        'Pull transaction data into return automatically',
        'Add or edit manual adjustment entries',
        'Review and approve return for filing',
        'File return electronically or download for manual filing',
      ]}
    />
  )
}

