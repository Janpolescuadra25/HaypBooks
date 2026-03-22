'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function UsFederalReturnsPage() {
  return (
    <PageDocumentation
      title="US Federal Returns"
      module="TAXES"
      badge="US ONLY"
      breadcrumb="Taxes / US Federal Returns"
      purpose="US Federal Returns manages the preparation and filing of federal income tax returns with the IRS for US-based business entities — including Form 1120 (C-Corp), Form 1120-S (S-Corp), Form 1065 (Partnership), and Form 1040-Schedule C (Sole Proprietor). This module aggregates financial data from across Haypbooks to populate return schedules, supports e-filing via the IRS Modernized e-File (MeF) system, and tracks estimated quarterly payments (Form 941, 1120-W). Proper federal return management reduces underpayment penalties and ensures IRS compliance."
      components={[
        { name: 'Return Type Selector', description: 'Dropdown to select the applicable federal return form based on entity structure.' },
        { name: 'Schedule Population Wizard', description: 'Step-by-step data pull from GL accounts and financial statements into federal return schedules.' },
        { name: 'Estimated Payment Tracker', description: 'Tracks IRS quarterly estimated tax payments (1120-W or 1040-ES) with amounts and due dates.' },
        { name: 'E-File Submission Panel', description: 'Direct IRS MeF e-filing action with validation, submission, and acknowledgment tracking.' },
        { name: 'Extension Tracker', description: 'Manages filing extensions (Form 7004) with original and extended due dates per entity.' },
      ]}
      tabs={['Return Preparation', 'Estimated Payments', 'E-Filing', 'Extensions', 'Prior Year Returns']}
      features={[
        'Prepare federal income tax returns for all US business entity types',
        'Auto-populate return schedules from Haypbooks financial data',
        'Track and record IRS quarterly estimated tax payments',
        'E-file directly to the IRS via MeF integration',
        'Manage automatic filing extensions with Form 7004',
        'Review prior year returns for comparison and carryforward items',
      ]}
      dataDisplayed={[
        'Entity type and applicable return form',
        'Taxable income and computed federal tax',
        'Estimated payments made and remaining liability',
        'Filing status and e-file confirmation number',
        'Extension status and extended due date',
      ]}
      userActions={[
        'Select federal return type for the entity',
        'Pull financial data into return schedules',
        'Record estimated tax payments',
        'E-file return via IRS MeF',
        'File extension with Form 7004',
      ]}
    />
  )
}

