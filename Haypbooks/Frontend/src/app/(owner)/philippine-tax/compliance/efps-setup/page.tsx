'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="eFPS Setup"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Compliance / eFPS Setup"
      badge="PH ONLY"
      purpose="eFPS Setup configures the company's BIR Electronic Filing and Payment System (eFPS) account details within Haypbooks. This includes the company's TIN, eFPS enrollment status, eFPS filer group (A through E — which determines extended filing deadlines), default bank account for eFPS payment, and the authorized eFPS user credentials. Once configured, the system applies the correct extended deadlines for eFPS filers in the compliance calendar and can generate eFPS-ready electronic submission files."
      components={[
        { name: 'Company eFPS Details', description: 'TIN, eFPS enrollment status, filer group, enrollment date, and authorized eFPS signatory.' },
        { name: 'Filer Group Deadline Calculator', description: 'Based on filer group A-E, automatically calculate extended deadlines for all forms (e.g., 2550M: Group E = 25th).' },
        { name: 'eFPS Bank Settings', description: 'Connected bank account for eFPS electronic tax payment: bank, account number, and authorized payment amount limit.' },
        { name: 'Multi-Entity eFPS', description: 'For multi-entity companies: configure eFPS details per legal entity (different TINs).' },
      ]}
      tabs={['eFPS Settings', 'Filer Group', 'Bank Payment Setup', 'Multi-Entity']}
      features={[
        'eFPS enrollment and filer group configuration',
        'Extended deadline auto-calculation per filer group',
        'Bank account setup for electronic tax payment',
        'Multi-entity eFPS management',
        'eFPS file format generation for all supported BIR forms',
      ]}
      dataDisplayed={[
        'Company TIN and eFPS enrollment status',
        'Filer group and applied extended deadlines',
        'Connected bank for eFPS payment',
        'Per-entity eFPS settings (multi-entity)',
      ]}
      userActions={[
        'Enter TIN and eFPS enrollment details',
        'Select filer group (A-E)',
        'Connect bank account for eFPS payment',
        'Configure per-entity eFPS settings',
        'Test eFPS file format generation',
      ]}
      relatedPages={[
        { label: 'Tax Compliance Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
        { label: 'BIR Forms', href: '/philippine-tax/bir-forms/form-2550m' },
        { label: 'Company Profile', href: '/settings/company/company-profile' },
      ]}
    />
  )
}

