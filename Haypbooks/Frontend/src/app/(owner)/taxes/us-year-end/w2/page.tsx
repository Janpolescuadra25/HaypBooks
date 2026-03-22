'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function FormW2Page() {
  return (
    <PageDocumentation
      title="W-2 Forms"
      module="TAXES"
      badge="US ONLY"
      breadcrumb="Taxes / US Year-End / W-2 Forms"
      purpose="W-2 Forms manages the preparation and distribution of IRS Form W-2 Wage and Tax Statements for all employees who received compensation during the tax year. This module pulls annual payroll data — including gross wages, federal income tax withheld, Social Security and Medicare taxes — and populates W-2 forms for each employee. W-2 forms must be furnished to employees by January 31 and filed with the SSA (Social Security Administration) by the same deadline."
      components={[
        { name: 'W-2 Generation Engine', description: 'Pulls annual payroll totals per employee to auto-populate all W-2 boxes from payroll records.' },
        { name: 'Employee W-2 Review Screen', description: 'Per-employee form view with all boxes editable for corrections before finalization.' },
        { name: 'W-3 Transmittal Summary', description: 'Auto-generated W-3 transmittal totaling all W-2 amounts for SSA submission.' },
        { name: 'SSA E-File Submission', description: 'Direct W-2/W-3 electronic filing to the Social Security Administration via BSO.' },
        { name: 'Employee Copy Distribution', description: 'Generate PDF W-2 copies for employee distribution or digital delivery by January 31.' },
      ]}
      tabs={['W-2 Review', 'W-3 Transmittal', 'E-Filing', 'Employee Distribution', 'Prior Year W-2s']}
      features={[
        'Auto-populate W-2 boxes from annual payroll records',
        'Review and correct individual employee W-2 forms',
        'Generate W-3 transmittal for SSA submission',
        'E-file W-2/W-3 electronically to SSA via BSO',
        'Distribute W-2 copies to employees by January 31 deadline',
        'Prepare and file W-2c corrections for amended W-2s',
      ]}
      dataDisplayed={[
        'Employee name, SSN, and address',
        'Gross wages and federal income tax withheld',
        'Social Security and Medicare wages and taxes',
        'State wages and state income tax withheld',
        'Filing status and SSA acknowledgment',
      ]}
      userActions={[
        'Review and edit employee W-2 forms',
        'Generate W-3 transmittal summary',
        'E-file W-2s to SSA',
        'Distribute W-2 copies to employees',
        'Prepare W-2c for corrections',
      ]}
    />
  )
}

