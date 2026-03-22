'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="SOX Controls"
      module="COMPLIANCE"
      breadcrumb="Compliance / Reporting / SOX Controls"
      badge="ENT"
      purpose="SOX Controls supports Sarbanes-Oxley compliance for public companies or companies preparing for public listing. It documents and tests the internal controls over financial reporting (ICFR), tracks management's assessment of controls, generates SOX evidence packages, and prepares the documentation required for external auditor review of control effectiveness."
      components={[
        { name: 'SOX Control Matrix', description: 'Complete SOX ICFR control matrix: process area, control ID, control objective, frequency, evidence type, and assessment result.' },
        { name: 'PCAOB Mapping', description: 'Maps controls to relevant financial statement assertions (existence, completeness, valuation, rights, presentation).' },
        { name: 'Testing Workpapers', description: 'Upload and attach audit workpapers and evidence for each control test.' },
        { name: 'Management Assessment', description: 'Management sign-off on control effectiveness per process area for the reporting period.' },
        { name: 'Deficiency Register', description: 'Track control weaknesses: material weakness, significant deficiency, or control deficiency with remediation plans.' },
      ]}
      tabs={['Control Matrix', 'Testing Workpapers', 'Management Assessment', 'Deficiencies', 'Evidence Package']}
      features={[
        'Full SOX ICFR control documentation framework',
        'Control testing workpaper management',
        'Management assessment sign-off workflow',
        'Deficiency classification and remediation tracking',
        'SOX evidence package generation for external auditors',
        'COSO framework alignment',
        'Section 302/404 compliance support',
      ]}
      dataDisplayed={[
        'SOX control IDs and objectives',
        'Financial statement assertions mapped',
        'Testing results and evidence status',
        'Management assessment sign-off status',
        'Deficiencies with severity classification',
        'Remediation plan status for each deficiency',
      ]}
      userActions={[
        'Document a new SOX control',
        'Upload testing workpaper evidence',
        'Record management assessment sign-off',
        'Log a control deficiency',
        'Track remediation plan progress',
        'Generate SOX evidence package for auditors',
        'Export full SOX control matrix',
      ]}
      relatedPages={[
        { label: 'Internal Controls', href: '/compliance/controls/internal-controls' },
        { label: 'Compliance Reports', href: '/compliance/reporting/compliance-reports' },
        { label: 'Audit Trails', href: '/automation/approvals-governance/audit-trails' },
      ]}
    />
  )
}

