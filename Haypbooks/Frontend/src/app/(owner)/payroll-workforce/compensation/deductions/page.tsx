'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Deductions"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compensation / Deductions"
      purpose="Deductions manages all non-mandatory payroll deductions for employees — loans (company loan, SSS salary loan, Pag-IBIG multi-purpose loan), cash advance deductions, housing loan deductions, uniform deductions, parking deductions, and other authorized deductions. Each deduction has an authorized amount, payment schedule (how much per cut-off), remaining balance, and end date. Active deductions are automatically included in the payroll computation without manual entry each period."
      components={[
        { name: 'Employee Deduction Setup', description: 'All active deductions per employee with type, total amount, installment per cut-off, balance remaining, and end date.' },
        { name: 'Deduction Authorization Form', description: 'Set up a new deduction: employee, deduction type, total authorized amount, start date, and installment schedule.' },
        { name: 'Loan Register', description: 'All active loan deductions with running outstanding balance.' },
        { name: 'Deduction Type Library', description: 'Library of deduction types: Company Loan, SSS Salary Loan, HDMF MPL, Cash Advance, Overpayment Recovery, etc.' },
      ]}
      tabs={['Active Deductions', 'Loan Register', 'Cash Advances', 'Setup New Deduction', 'Deduction History']}
      features={[
        'Recurring payroll deduction management',
        'Loan balance tracking (auto-reduce on each deduction)',
        'Multiple deduction types supported',
        'Automatic deduction inclusion in payroll',
        'Deduction end date with auto-stop',
        'Full deduction history per employee',
      ]}
      dataDisplayed={[
        'All active deductions per employee',
        'Running loan balances',
        'Total deductions per employee per cut-off',
        'Deductions ending in this period',
        'Cash advance amounts and recovery schedule',
      ]}
      userActions={[
        'Set up a new deduction',
        'Adjust deduction installment amount',
        'View loan balance for an employee',
        'Stop a deduction early',
        'Process bulk deductions (SSS loan batch)',
        'Export deduction report',
      ]}
      relatedPages={[
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Employee List', href: '/payroll-workforce/employees/employee-list' },
        { label: 'Government Reports', href: '/payroll-workforce/compliance/government-reports' },
      ]}
    />
  )
}

