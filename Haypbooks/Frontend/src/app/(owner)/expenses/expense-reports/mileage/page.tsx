'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Mileage"
      module="EXPENSES"
      breadcrumb="Expenses / Expense Reports / Mileage"
      purpose="Mileage manages employee business travel mileage reimbursements. Employees log trips with origin, destination, purpose, distance (auto-calculated or manual entry), and vehicle type. The system calculates the reimbursement amount using the configured rate per kilometer (or per mile for US operations). The mileage log feeds into expense reports for approval and reimbursement. The page also tracks total annual mileage for any tax reporting purposes."
      components={[
        { name: 'Mileage Log', description: 'All mileage entries with date, origin, destination, trip purpose, distance, rate, and reimbursement amount.' },
        { name: 'Trip Entry Form', description: 'Log a new trip: date, origin, destination, purpose, vehicle type, distance (or auto-calculate from addresses), and notes.' },
        { name: 'Rate Configuration', description: 'Set reimbursement rate per km per vehicle type (standard car, executive car, motorcycle, own vehicle).' },
        { name: 'Monthly Summary', description: 'Total km and reimbursement amount by month for each employee.' },
      ]}
      tabs={['Mileage Log', 'Log Trip', 'Rate Settings', 'Monthly Summary']}
      features={[
        'Business trip mileage logging',
        'Configurable rate per km per vehicle type',
        'Auto-reimbursement calculation',
        'Integration with expense reports',
        'Google Maps distance assist (future feature)',
        'Annual mileage total reporting',
      ]}
      dataDisplayed={[
        'All mileage trips with calculated reimbursement',
        'YTD total km and total reimbursement',
        'Mileage rate per vehicle type',
        'Monthly mileage summary',
      ]}
      userActions={[
        'Log a new business trip',
        'Edit distance or purpose',
        'Include mileage in expense report',
        'Update mileage reimbursement rate',
        'Export mileage log for payroll or tax',
      ]}
      relatedPages={[
        { label: 'My Expenses', href: '/expenses/expense-reports/my-expenses' },
        { label: 'Expense Approval', href: '/expenses/expense-reports/expense-approval' },
      ]}
    />
  )
}

