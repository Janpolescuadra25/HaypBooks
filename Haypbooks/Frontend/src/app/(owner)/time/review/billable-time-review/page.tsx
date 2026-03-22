'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function BillableTimeReviewPage() {
  return (
    <PageDocumentation
      title="Billable Time Review"
      module="TIME"
      breadcrumb="Time / Review / Billable Time Review"
      purpose="Billable Time Review is the billing manager's workspace for reviewing approved time entries that are ready to be invoiced to clients. This page surfaces all unbilled billable hours grouped by customer and project, allowing the billing team to select entries, adjust rates if needed, and generate invoices directly. The workflow ensures no billable time is lost or double-billed."
      components={[
        { name: 'Unbilled Hours Summary', description: 'Header cards showing total unbilled hours and value per customer for the current period.' },
        { name: 'Billable Entries Table', description: 'Grouped table of approved billable entries by customer with select-all per customer capability.' },
        { name: 'Rate Override Column', description: 'Inline editable rate column to adjust the billable rate on specific entries before invoicing.' },
        { name: 'Create Invoice Action', description: 'Button to generate an invoice from selected entries, pre-populating line items from time descriptions.' },
        { name: 'Mark as Non-Billable', description: 'Option to reclassify selected entries as non-billable without deleting them from the time log.' },
      ]}
      tabs={['Unbilled Hours', 'In Review', 'Billed This Period']}
      features={[
        'Review all approved unbilled hours ready for invoicing',
        'Group unbilled time by customer and project',
        'Adjust hourly rates before invoice creation',
        'Generate invoices directly from selected time entries',
        'Reclassify entries as non-billable if agreed-on exceptions apply',
        'Track which entries were billed on which invoice',
      ]}
      dataDisplayed={[
        'Customer and project groupings with total unbilled hours',
        'Individual entry date, employee, task, hours, and rate',
        'Calculated billing value per entry',
        'Approval date and approver name',
        'Invoice number if previously billed',
      ]}
      userActions={[
        'Select entries for invoice generation',
        'Adjust billable rate before invoicing',
        'Create invoice from selected entries',
        'Mark entries as non-billable',
        'Filter by customer, project, or date range',
      ]}
    />
  )
}

