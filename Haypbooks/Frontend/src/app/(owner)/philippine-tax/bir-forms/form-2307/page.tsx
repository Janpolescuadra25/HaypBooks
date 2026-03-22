'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 2307"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 2307"
      badge="PH ONLY"
      purpose="BIR Form 2307 (Certificate of Creditable Tax Withheld at Source) is generated and issued to vendors/payees from whom the company has withheld Expanded Withholding Tax (EWT/Creditable Withholding Tax). It is also received from customers who withheld from payments to the company. The form shows the payor, payee, tax period, income payments, applicable tax rate, and amount withheld. Vendors use the 2307 they receive to credit against their quarterly income tax due. The system auto-generates 2307s from all EWT transactions recorded."
      components={[
        { name: '2307 Generator', description: 'Automatically generate 2307 certificates for all vendors EWT was withheld from in the selected period.' },
        { name: '2307 Library', description: 'Archive of all issued 2307s by period, payee, and income type.' },
        { name: 'Received 2307 Recording', description: 'Record 2307s received from customers who withheld from the company — credited in the company\'s income tax return.' },
        { name: 'Email Distribution', description: 'Batch email 2307 PDFs to all relevant vendors for the quarter.' },
      ]}
      tabs={['Generated 2307s', 'Received 2307s', 'Generate for Period', 'Send to Vendors']}
      features={[
        'Auto-generate BIR 2307 from EWT transactions',
        'Batch generation by quarter or year',
        'Batch email distribution to vendors',
        'Received 2307 recording for income tax credit',
        'BIR-compliant PDF format',
        'Archive of all issued and received 2307s',
      ]}
      dataDisplayed={[
        'All 2307s generated with payee and amount',
        '2307s received from customers',
        'Total EWT withheld per vendor per period',
        'Issuance status (draft/issued/emailed)',
      ]}
      userActions={[
        'Generate 2307s for a quarter',
        'Email 2307 to vendor',
        'Record received 2307 from customer',
        'Download 2307 PDF',
        'Batch download all 2307s for a period',
        'Correct and reissue an erroneous 2307',
      ]}
      relatedPages={[
        { label: 'EWT', href: '/philippine-tax/bir-forms/form-1601eq' },
        { label: 'Alphalist', href: '/philippine-tax/reports/alphalist' },
        { label: 'Vendor List', href: '/expenses/vendors/vendor-list' },
        { label: 'Tax Mapping', href: '/philippine-tax/compliance/tax-mapping' },
      ]}
    />
  )
}

