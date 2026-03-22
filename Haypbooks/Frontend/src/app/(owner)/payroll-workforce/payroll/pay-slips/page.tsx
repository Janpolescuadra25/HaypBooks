'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Pay Slips"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Payroll / Pay Slips"
      purpose="Pay Slips provides access to all generated payslips — both the employer's filing copy and the employee self-service view. Each payslip shows: employee name, period covered, basic salary, all allowances and earnings, all deductions (SSS, PhilHealth, HDMF, withholding tax, other deductions), and net take-home pay. Employees can access their own payslips digitally. HR can generate, reprint, and email payslips to employees. Pay slip archives are maintained for audit and BIR compliance."
      components={[
        { name: 'Pay Slip Search', description: 'Search payslips by employee name or ID and payroll period.' },
        { name: 'Pay Slip Viewer', description: 'Full digital payslip: header (company, employee, period), earnings breakdown, deductions breakdown, and net pay. Display matches official payslip format.' },
        { name: 'Bulk Actions', description: 'Generate and email payslips to all employees for a payroll run. Generate PDF batch for printing.' },
        { name: 'Employee Self-Service', description: 'Employees access their own payslips in their self-service portal — no need to email or print for routine requests.' },
        { name: 'Annual Pay Summary', description: 'Year-to-date earnings and deductions per employee — used for BIR Form 2316 preparation.' },
      ]}
      tabs={['By Payroll Run', 'By Employee', 'Email Pay Slips', 'Annual Summary']}
      features={[
        'Digital payslip generation and distribution',
        'Employee self-service payslip access',
        'BIR-compliant payslip format',
        'Batch email distribution for pay runs',
        'PDF batch download and print',
        'Annual earnings summary per employee (for 2316)',
        'Payslip archive for audit and compliance',
      ]}
      dataDisplayed={[
        'All payslips by run or employee',
        'Earnings and deductions per period',
        'YTD cumulative earnings and deductions',
        'Withheld tax per period and YTD',
        'Government contributions per period',
      ]}
      userActions={[
        'View payslip for any employee and period',
        'Email payslips to all employees for a run',
        'Download payslip PDF',
        'Generate annual earnings summary',
        'Reprint a specific payslip',
      ]}
      relatedPages={[
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
        { label: 'Alphalist', href: '/philippine-tax/reports/alphalist' },
      ]}
    />
  )
}

