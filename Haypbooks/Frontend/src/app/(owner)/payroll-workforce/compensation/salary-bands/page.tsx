'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Salary Bands"
      module="PAYROLL & WORKFORCE"
      breadcrumb="Payroll & Workforce / Compensation / Salary Bands"
      purpose="Salary Bands defines the compensation structure for all positions and grades in the organization — the minimum, midpoint, and maximum salary for each job grade and level. The salary band framework ensures internal equity (employees in the same grade are paid within the same range) and external competitiveness (ranges are benchmarked against market). When processing promotions or new hires, the salary offered is validated against the band for the target position."
      components={[
        { name: 'Grade Structure', description: 'All job grades (Band 1 – Executive, etc.) with min, mid, and max salary range per grade.' },
        { name: 'Position-to-Grade Mapping', description: 'Each position title mapped to its corresponding grade, establishing which salary range applies.' },
        { name: 'Compa-Ratio Analysis', description: 'For each employee: their actual salary as a % of the band midpoint (compa-ratio). Identifies if employees are below/at/above midpoint.' },
        { name: 'Market Benchmarking', description: 'Upload or enter market survey data to compare company ranges against market median.' },
      ]}
      tabs={['Salary Bands', 'Position Mapping', 'Compa-Ratio', 'Market Benchmarking']}
      features={[
        'Salary grade and band structure management',
        'Position-to-grade mapping',
        'Compa-ratio analysis for equity review',
        'Market benchmarking comparison',
        'Band breach alerts when salary falls outside range',
        'Annual band adjustment workflow',
      ]}
      dataDisplayed={[
        'All grades with min, mid, max salary ranges',
        'Positions mapped to each grade',
        'Employees in each grade with compa-ratio',
        'Employees below band minimum (red)',
        'Employees above band maximum',
      ]}
      userActions={[
        'Create or edit salary bands',
        'Map positions to grades',
        'View compa-ratio for all employees',
        'Update bands annually (merit round)',
        'Upload market survey data',
        'Export band and compa-ratio report',
      ]}
      relatedPages={[
        { label: 'Employee List', href: '/payroll-workforce/employees/employee-list' },
        { label: 'Benefits', href: '/payroll-workforce/compensation/benefits' },
        { label: 'Payroll Runs', href: '/payroll-workforce/payroll/payroll-runs' },
      ]}
    />
  )
}

