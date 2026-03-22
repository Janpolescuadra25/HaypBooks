'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 1604C"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 1604C"
      badge="PH ONLY"
      purpose="BIR Form 1604C (Annual Information Return of Income Taxes Withheld on Compensation) is filed annually by employers, summarizing the total compensation paid and total withholding tax withheld for all employees for the entire year. It is accompanied by the Alphalist of employees (Schedule 1). The 1604C is different from the monthly 1601C: while 1601C is for remitting monthly withheld tax, the 1604C is the annual reconciliation of total compensation and taxes by employee. It is due on January 31 of the following year."
      components={[
        { name: '1604C Computation', description: 'Annual totals: all employees, total compensation paid, total withholding tax withheld for the year.' },
        { name: 'Alphalist (Schedule 1)', description: 'Per-employee annex: employee name, TIN, total compensation, total tax withheld, and substituted filing indicator.' },
        { name: 'Substituted Filing List', description: 'Employees whose BIR Form 2316 constitutes substituted filing of their own individual income tax return.' },
        { name: 'EFPS File Generator', description: 'BIR EFPS-compatible 1604C filing format.' },
        { name: 'Form 2316 Generator', description: 'Generate BIR Form 2316 (Certificate of Final Tax Withheld at Source) for each employee from the 1604C data.' },
      ]}
      tabs={['Annual Computation', 'Alphalist Preview', '2316 Generation', 'EFPS File', 'Filing History']}
      features={[
        'Annual payroll withholding tax reconciliation',
        'Alphalist of employees for annual filing',
        'BIR 2316 certificate generation per employee',
        'Substituted filing management',
        'EFPS filing format',
        'Auto-populated from payroll data',
      ]}
      dataDisplayed={[
        'All employees with annual compensation and tax withheld',
        'Total compensation and tax for the year',
        'Employees eligible for substituted filing',
        'Year-end reconciliation vs. monthly 1601C totals',
      ]}
      userActions={[
        'Compute 1604C for the year',
        'Review and validate alphalist',
        'Generate 2316 for all employees',
        'Mark employees as substituted filers',
        'Generate EFPS filing file',
        'Mark as filed',
      ]}
      relatedPages={[
        { label: 'Form 1601C', href: '/philippine-tax/bir-forms/form-1601c' },
        { label: 'Alphalist', href: '/philippine-tax/reports/alphalist' },
        { label: 'Pay Slips', href: '/payroll-workforce/payroll/pay-slips' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
      ]}
    />
  )
}

