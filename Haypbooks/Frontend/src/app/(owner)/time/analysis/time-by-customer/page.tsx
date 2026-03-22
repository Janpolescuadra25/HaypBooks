'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TimeByCustomerPage() {
  return (
    <PageDocumentation
      title="Time by Customer"
      module="TIME"
      breadcrumb="Time / Analysis / Time by Customer"
      purpose="Time by Customer provides a detailed breakdown of all billable and non-billable hours logged against each customer, allowing managers to understand where employee time is being invested across the client portfolio. This analysis drives billing accuracy, highlights over-serviced accounts, and informs contract renewals or rate negotiations. The report can be filtered by team member, project, and date range for targeted insights."
      components={[
        { name: 'Customer Time Summary Table', description: 'Sortable table showing each customer with total hours, billable hours, billed value, and avg hourly rate.' },
        { name: 'Date Range Picker', description: 'Filter controls for analyzing time within a specific week, month, quarter, or custom date range.' },
        { name: 'Team Member Filter', description: 'Dropdown to focus analysis on time logged by a specific employee or team.' },
        { name: 'Billable vs. Non-Billable Chart', description: 'Stacked bar chart per customer showing split between billable and non-billable hours.' },
        { name: 'Export Controls', description: 'Export the time-by-customer report to CSV or PDF for client billing reviews.' },
      ]}
      tabs={['Summary View', 'Detailed Log', 'Billing Status', 'Trends']}
      features={[
        'View total logged hours per customer with billable/non-billable split',
        'Drill into individual time entries for any customer',
        'Filter by employee, project, date range, or billing status',
        'Compare hours vs. contracted hours to spot over/under-servicing',
        'Export customer time report for billing review or client discussion',
        'Visualize billable utilization rate per customer',
      ]}
      dataDisplayed={[
        'Customer name and total hours logged',
        'Billable hours and billed amount',
        'Non-billable hours and reason categories',
        'Average hourly rate per customer',
        'Unbilled hours awaiting invoice creation',
      ]}
      userActions={[
        'Filter report by customer, employee, or date range',
        'Drill into individual time entries per customer',
        'Export time-by-customer report',
        'Create invoice from unbilled hours',
        'Compare current period vs. prior period',
      ]}
    />
  )
}

