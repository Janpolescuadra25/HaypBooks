'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Alphalist"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / Reports / Alphalist"
      badge="PH ONLY"
      purpose="The Alphalist (Schedule 1 of BIR Form 1604C and the Alphalist of Payees for 1601EQ) is a comprehensive per-payee or per-employee listing of all income payments made and taxes withheld during the year. The Alphalist of Employees accompanies Form 1604C; the Alphalist of Payees accompanies 1601EQ. Both are submitted in BIR-specified DAT file format (alphalist validation module format). Haypbooks generates both alphalists automatically from the payroll and AP data, ready for BIR DAT file submission."
      components={[
        { name: 'Employee Alphalist', description: 'Annex to 1604C: per employee — TIN, name, total compensation, taxes withheld fringe benefits, and substituted filing status.' },
        { name: 'Payee Alphalist', description: 'Annex to 1601EQ: per vendor/payee — TIN, name, ATC, income payments, and taxes withheld in the year.' },
        { name: 'DAT File Generator', description: 'Generate BIR-compliant DAT file in the exact format required by the BIR Alphalist Validation Module (AVM).' },
        { name: 'TIN Verification Status', description: 'Flag payees with missing or invalid TIN — required for alphalist submission.' },
        { name: 'Alphalist Summary', description: 'Total income payments and taxes withheld by payee type and ATC for the year.' },
      ]}
      tabs={['Employee Alphalist', 'Payee Alphalist', 'DAT File', 'TIN Verification', 'Summary']}
      features={[
        'BIR-compliant alphalist DAT file generation',
        'Both employee and payee alphalists',
        'TIN validation and missing TIN alerts',
        'Integration with 1604C and 1601EQ',
        'Year-end alphalist from all payroll and AP data',
        'BIR Alphalist Validation Module (AVM) format',
      ]}
      dataDisplayed={[
        'All employees with annual compensation and tax withheld',
        'All vendors with annual payments and EWT withheld',
        'TIN status per payee',
        'Total compensation and EWT for the year',
        'Payees with incomplete data (flagged)',
      ]}
      userActions={[
        'Generate employee alphalist for 1604C',
        'Generate payee alphalist for 1601EQ',
        'Download BIR DAT file',
        'Fix missing TINs before submission',
        'Validate alphalist data before downloading',
      ]}
      relatedPages={[
        { label: 'Form 1604C', href: '/philippine-tax/bir-forms/form-1604c' },
        { label: 'Form 1601EQ', href: '/philippine-tax/bir-forms/form-1601eq' },
        { label: 'Form 2307', href: '/philippine-tax/bir-forms/form-2307' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
      ]}
    />
  )
}

