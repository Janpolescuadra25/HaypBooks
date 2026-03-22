'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Compensation Withholding Tax"
      module="TAXES"
      breadcrumb="Taxes / Withholding Tax / Compensation WT"
      purpose="Compensation Withholding Tax tracks the withholding tax deducted from employees' salaries in every payroll run. Unlike EWT which covers vendor payments, compensation withholding tax applies to employment income subject to the BIR graduated tax table. This page provides an overview of all withholding tax withheld from compensation in the current year, by employee and by month, and reconciles against the monthly 1601C filings already submitted. This is the GL-level view complementing the payroll module's 1601C reports."
      components={[
        { name: 'Monthly WT Summary', description: 'Month-by-month total compensation WT withheld and amount remitted via 1601C.' },
        { name: 'Employee WT Register', description: 'Per employee: monthly tax withheld and YTD total — cross-reference with payslips.' },
        { name: '1601C Reconciliation', description: 'Reconcile GL Withholding Tax Payable account balance against total 1601C filings and remittances.' },
        { name: 'Annual WT Summary', description: 'Year total for 1604C preparation: all employees, total compensation, total WT withheld.' },
      ]}
      tabs={['Monthly Summary', 'By Employee', '1601C Reconciliation', 'Annual Summary']}
      features={[
        'Compensation WT overview by period',
        'Per-employee withholding tax tracking',
        'GL vs. 1601C remittance reconciliation',
        'Annual summary for 1604C preparation',
        'Integration with payroll module data',
      ]}
      dataDisplayed={[
        'Monthly total WT withheld from compensation',
        'YTD WT per employee',
        'GL Withholding Tax Payable account balance',
        'Remitted amounts (1601C payments)',
        'Variance between GL and remitted',
      ]}
      userActions={[
        'View monthly compensation WT summary',
        'Review per-employee WT details',
        'Reconcile GL WT Payable vs. 1601C',
        'Navigate to annual 1604C preparation',
        'Export compensation WT register',
      ]}
      relatedPages={[
        { label: 'Form 1601C', href: '/philippine-tax/bir-forms/form-1601c' },
        { label: 'Form 1604C', href: '/philippine-tax/bir-forms/form-1604c' },
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Alphalist', href: '/philippine-tax/reports/alphalist' },
      ]}
    />
  )
}

