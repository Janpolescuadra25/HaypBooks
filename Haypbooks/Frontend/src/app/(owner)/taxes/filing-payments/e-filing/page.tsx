'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function EFilingPage() {
  return (
    <PageDocumentation
      title="E-Filing"
      module="TAXES"
      breadcrumb="Taxes / Filing & Payments / E-Filing"
      purpose="E-Filing provides integration with government tax portals and electronic filing systems to submit tax returns and forms directly from Haypbooks without manual re-entry. The module validates return data against filing rules, generates the required submission file, and tracks acknowledgment from tax authorities. Supported e-filing channels include BIR eFPS and eBIRForms for Philippine filers, and IRS MeF for US filers."
      components={[
        { name: 'Filing Queue', description: 'List of tax forms ready for e-filing with validation status, due date, and file-now action.' },
        { name: 'Form Validator', description: 'Pre-submission validation engine that checks for errors, missing fields, and compliance rule violations.' },
        { name: 'Portal Credential Config', description: 'Secure storage for government portal credentials (eFPS, eBIRForms, MeF) used for submission.' },
        { name: 'Submission Status Tracker', description: 'Real-time status tracker showing submitted, pending acknowledgment, accepted, and rejected filings.' },
        { name: 'Acknowledgment Receipt Store', description: 'Repository of all electronic acknowledgment receipts from tax authorities for compliance records.' },
      ]}
      tabs={['Filing Queue', 'Ready to File', 'Submitted', 'Acknowledgments', 'Rejected']}
      features={[
        'Validate tax return data before e-filing to prevent rejection',
        'Submit returns directly to government portals via API integration',
        'Track submission status from filed to acknowledged',
        'Store all e-filing acknowledgment receipts for compliance',
        'Manage portal credentials securely for multiple filing authorities',
        'Re-submit rejected filings with error corrections',
      ]}
      dataDisplayed={[
        'Tax form type and tax period covered',
        'Filing due date and submission status',
        'Validation errors or warnings',
        'Acknowledgment receipt number and date',
        'Portal used and submitting user',
      ]}
      userActions={[
        'Validate a return before filing',
        'Submit return via e-filing integration',
        'View submission acknowledgment receipt',
        'Correct and resubmit rejected filings',
        'Configure government portal credentials',
      ]}
    />
  )
}

