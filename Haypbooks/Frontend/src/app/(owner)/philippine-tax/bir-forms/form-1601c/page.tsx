'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="BIR Form 1601C"
      module="PHILIPPINE TAX"
      breadcrumb="Philippine Tax / BIR Forms / Form 1601C"
      badge="PH ONLY"
      purpose="BIR Form 1601C (Monthly Remittance Return of Income Taxes Withheld on Compensation) is filed monthly by employers to remit the withholding tax deducted from employees' salaries. The form summarizes total employees, total compensation, total tax withheld in the month, and the amount due for remittance. It is due on the 10th of the following month (or 15th for eFPS filers). Haypbooks auto-computes the 1601C from the payroll data and generates the EFPS-ready submission file."
      components={[
        { name: '1601C Computation', description: 'Auto-compute from payroll: total employees, total compensation paid, and total withholding tax withheld in the period.' },
        { name: 'Form Preview', description: 'Preview the completed 1601C form in BIR-accurate layout before filing.' },
        { name: 'EFPS File Generator', description: 'Generate the BIR EFPS-compatible file for electronic submission.' },
        { name: 'Filing History', description: 'Archive of all filed 1601Cs with confirmation numbers and payment references.' },
      ]}
      tabs={['Compute for Period', 'Form Preview', 'EFPS File', 'Filing History']}
      features={[
        'Auto-computation of 1601C from payroll data',
        'EFPS electronic filing format generation',
        'BIR-compliant form layout preview',
        'Monthly filing calendar integration',
        'Filing history with confirmation tracking',
        'Amended return support',
      ]}
      dataDisplayed={[
        'Total compensation and withholding tax for the period',
        'Number of employees in the period',
        'Prior payments and credits',
        'Amount due for remittance',
        'Prior months\' filing history',
      ]}
      userActions={[
        'Compute 1601C for the selected month',
        'Review and validate computation',
        'Generate EFPS file',
        'Mark 1601C as filed with date and confirmation',
        'Generate amended 1601C if needed',
        'View prior filings',
      ]}
      relatedPages={[
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
        { label: 'EFPS Setup', href: '/philippine-tax/compliance/efps-setup' },
        { label: 'Tax Calendar', href: '/philippine-tax/compliance/tax-compliance-calendar' },
      ]}
    />
  )
}

