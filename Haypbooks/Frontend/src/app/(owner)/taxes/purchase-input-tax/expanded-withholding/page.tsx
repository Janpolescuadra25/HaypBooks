'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function ExpandedWithholdingPage() {
  return (
    <PageDocumentation
      title="Expanded Withholding"
      module="TAXES"
      badge="PH ONLY"
      breadcrumb="Taxes / Purchase & Input Tax / Expanded Withholding"
      purpose="Expanded Withholding Tax (EWT) tracks the 2% to 15% withholding obligations when the business pays certain professional services, rentals, commissions, and other income to suppliers subject to EWT under Philippines BIR regulations. This module calculates EWT automatically based on vendor classification and payment type, generates BIR Form 2307 certificates for distribution to payees, and accumulates EWT liabilities for monthly remittance reporting."
      components={[
        { name: 'EWT Computation Table', description: 'Purchase transactions subject to EWT with vendor, income classification, gross amount, and withheld tax.' },
        { name: 'Withholding Rate Matrix', description: 'Configuration of EWT rates per ATC (alphanumeric tax code) and income classification type.' },
        { name: 'Form 2307 Generator', description: 'Generates printable or downloadable BIR Form 2307 Withholding Tax Certificates for payees.' },
        { name: 'Monthly EWT Liability Summary', description: 'Aggregated monthly EWT liability ready for remittance via BIR Form 1601-EQ.' },
        { name: 'Vendor Withholding Profile', description: 'Per-vendor setting for applicable EWT rate and income classification for auto-computation.' },
      ]}
      tabs={['Transactions', '2307 Certificates', 'Monthly Liability', 'Rate Configuration', 'Vendor Profiles']}
      features={[
        'Auto-calculate EWT on qualifying purchase transactions',
        'Apply correct ATC code and rate per vendor and income type',
        'Generate BIR Form 2307 certificates for payee distribution',
        'Summarize monthly EWT liability for Form 1601-EQ remittance',
        'Configure withholding rate per vendor classification',
        'Track and reconcile EWT withheld vs. remitted',
      ]}
      dataDisplayed={[
        'Vendor name, TIN, and income classification',
        'Gross payment amount and EWT computed',
        'ATC code and applicable withholding rate',
        'Certificate number and date generated',
        'Monthly EWT liability total',
      ]}
      userActions={[
        'Review and confirm EWT computations for the period',
        'Generate Form 2307 certificates for vendors',
        'Configure vendor withholding profiles',
        'View monthly EWT liability for remittance',
        'Export EWT detail for BIR filing support',
      ]}
    />
  )
}

