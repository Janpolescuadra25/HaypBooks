'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Benefits"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compensation / Benefits"
      purpose="Benefits manages the employee benefits program — HMO/medical insurance, life insurance, rice allowance, transportation allowance, clothing allowance, meal subsidy, mobile allowance, gym, retirement plan, and other non-mandatory benefits. Benefit enrollment, coverage start date, coverage amount, and payroll treatment (taxable/non-taxable under TRAIN Law De Minimis rules) are managed here. Benefits that impact payroll (taxable allowances above De Minimis limits) feed into the payroll computation automatically."
      components={[
        { name: 'Benefits Catalog', description: 'All available employee benefits with type, amount/coverage, taxability, and applicable employee groups.' },
        { name: 'Employee Enrollment', description: 'For each employee: which benefits they are enrolled in, effective date, and coverage allocation.' },
        { name: 'De Minimis Tracker', description: 'Tracks whether employee non-mandatory benefits stay within BIR De Minimis limits (non-taxable ceiling per benefit type).' },
        { name: 'HMO Management', description: 'HMO provider, plan type, coverage limit, and HMO member ID per employee.' },
        { name: 'Annual Leave Conversion', description: 'Cash conversion of unused leave entitlements (monetization) as a benefit.' },
      ]}
      tabs={['Benefits Catalog', 'Employee Enrollment', 'De Minimis Tracker', 'HMO', 'Leave Monetization']}
      features={[
        'Benefits catalog management',
        'Employee-level benefits enrollment',
        'BIR De Minimis ceiling tracking',
        'HMO enrollment and coverage details',
        'Benefit amounts integrate with payroll computation',
        'Taxable vs. non-taxable benefit classification',
      ]}
      dataDisplayed={[
        'All benefit types and amounts',
        'Employee enrollment per benefit',
        'De Minimis utilization per employee',
        'HMO coverage and expiry per employee',
        'Benefits cost per employee and total',
      ]}
      userActions={[
        'Create a new benefit type',
        'Enroll an employee in a benefit',
        'Update benefit amounts',
        'Check De Minimis status for employee',
        'Process leave monetization',
        'Export benefits cost report',
      ]}
      relatedPages={[
        { label: 'Employee List', href: '/payroll-workforce/employees/employee-list' },
        { label: 'Salary Bands', href: '/payroll-workforce/compensation/salary-bands' },
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
        { label: 'Deductions', href: '/payroll-workforce/compensation/deductions' },
      ]}
    />
  )
}

