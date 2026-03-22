'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="13th Month Pay"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compliance / 13th Month Pay"
      badge="PH ONLY"
      purpose="13th Month Pay automates the computation of the mandatory 13th month pay benefit required under Philippine Presidential Decree 851. The computation is: Total basic pay earned in the year ÷ 12. The 13th month pay is tax-exempt up to PHP 90,000 under the TRAIN Law. The system pro-rates for new hires and employees who resign during the year. The 13th month run generates the payroll entries, pay slips, and the required DOLE report certifying the company has paid the benefit."
      components={[
        { name: 'Computation Wizard', description: 'Run-by-run computation: select year, compute total basic pay per employee, calculate 13th month amount, review, finalize, and post to payroll.' },
        { name: 'Employee 13th Month Details', description: 'Per-employee: monthly basic pay per month + total basic used in computation + computed 13th month amount.' },
        { name: 'Tax Exemption Tracker', description: 'Track if the 13th month (combined with other mandated benefits) exceeds the PHP 90,000 BIR tax exemption cap. Excess is subject to withholding tax.' },
        { name: 'DOLE Report Generator', description: 'Generate the DOLE Establishment Report on 13th Month Pay for regulatory compliance filing.' },
      ]}
      tabs={['Compute 13th Month', 'Employee Details', 'Tax Exemption', 'DOLE Report', 'History']}
      features={[
        'Automated 13th month pay computation (PD 851)',
        'Pro-rating for new hires and resignees during the year',
        'PHP 90,000 tax exemption management',
        'Withholding tax on excess over exemption',
        'DOLE report generation',
        'Integration with payroll run (new pay run or special run)',
      ]}
      dataDisplayed={[
        'All active employees with computed 13th month',
        'Monthly basic pay used in computation',
        'Pro-rated amounts for new hires/resignees',
        'Tax-exempt vs. taxable portion per employee',
        'Total 13th month cost for the year',
      ]}
      userActions={[
        'Run 13th month computation for the year',
        'Review and adjust individual amounts if needed',
        'Post 13th month as a special payroll run',
        'Generate DOLE report',
        'Generate pay slips for 13th month',
        'View 13th month history from prior years',
      ]}
      relatedPages={[
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
        { label: 'Pay Slips', href: '/payroll-workforce/payroll/pay-slips' },
        { label: 'Alphalist', href: '/philippine-tax/reports/alphalist' },
      ]}
    />
  )
}

