'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Form1099Page() {
  return (
    <PageDocumentation
      title="1099 Forms"
      module="TAXES"
      badge="US ONLY"
      breadcrumb="Taxes / US Year-End / 1099 Forms"
      purpose="1099 Forms manages the preparation and e-filing of IRS Form 1099-NEC, 1099-MISC, 1099-INT, and other information returns for independent contractors, vendors, and other US payees who were paid above IRS reporting thresholds during the tax year. This module identifies qualifying payments from the vendor payment records, prepopulates 1099 data, and supports e-filing via IRS FIRE or through a third-party 1099 filing service. Timely 1099 filing avoids IRS penalties for failure to file or furnish."
      components={[
        { name: 'Qualifying Payee Report', description: 'Auto-generated list of vendors/payees meeting the $600+ (or applicable) threshold for 1099 reporting.' },
        { name: '1099 Form Editor', description: 'Editable form view showing pre-populated 1099 data per payee for review and correction.' },
        { name: 'TIN Verification', description: 'Integration with IRS TIN Matching to validate payee tax identification numbers before filing.' },
        { name: 'E-File via FIRE / Third-Party', description: 'Direct e-filing submission to IRS FIRE system or supported third-party 1099 service.' },
        { name: 'Payee Copy Distribution', description: 'Generate and send/email 1099 copies to payees by January 31 deadline.' },
      ]}
      tabs={['Qualifying Payees', '1099 Review', 'TIN Matching', 'E-Filing', 'Payee Distribution']}
      features={[
        'Automatically identify payees meeting IRS 1099 reporting thresholds',
        'Pre-populate 1099 forms from vendor payment records',
        'Validate payee TINs via IRS TIN Matching service',
        'E-file 1099s via IRS FIRE or third-party integrations',
        'Generate and distribute payee copies by January 31 deadline',
        'Track filing status and acknowledgment per payee',
      ]}
      dataDisplayed={[
        'Payee name, TIN, and address',
        'Total payments per payee by payment category',
        '1099 form type applicable to each payee',
        'TIN validation status',
        'Filing status and IRS acknowledgment',
      ]}
      userActions={[
        'Review qualifying payee list',
        'Edit or correct 1099 form data',
        'Run TIN matching validation',
        'E-file 1099 forms to IRS',
        'Send payee copies via mail or email',
      ]}
    />
  )
}

