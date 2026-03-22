'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TaxCenterFilingPaymentsPage() {
  return (
    <PageDocumentation
      title="Tax Center — Filing & Payments"
      module="TAXES"
      breadcrumb="Taxes / Tax Center / Filing & Payments"
      purpose="Tax Center Filing & Payments is the operational hub for managing all upcoming tax filing deadlines and payment due dates in one consolidated view. Finance teams use this page to ensure no filing or payment obligation is missed, with color-coded urgency indicators and direct links to the corresponding return preparation module. Completed filings and payments are logged here for quick reference and compliance confirmation."
      components={[
        { name: 'Obligation Calendar', description: 'Monthly calendar view of all tax filing and payment due dates with urgency color coding.' },
        { name: 'Upcoming Obligations List', description: 'Sorted list of the next 30 days of tax obligations with days-to-due-date countdown.' },
        { name: 'Completed This Period', description: 'Checklist of obligations completed this period with filed date and confirmation number.' },
        { name: 'Quick Links Panel', description: 'One-click links to open the preparation module for each upcoming obligation.' },
        { name: 'Overdue Alert Banner', description: 'Prominent banner listing any obligations that have passed their due date without completion.' },
      ]}
      tabs={['Calendar', 'Upcoming', 'Completed', 'Overdue']}
      features={[
        'Single-screen view of all upcoming tax filing and payment deadlines',
        'Color-coded urgency: green (on track), amber (due soon), red (overdue)',
        'Quick-link to return preparation for each obligation',
        'Track completion status with confirmation numbers',
        'Alert on overdue obligations with penalty risk estimate',
        'Filter obligations by tax type or authority',
      ]}
      dataDisplayed={[
        'Tax obligation type and authority',
        'Due date and days remaining',
        'Completion status and confirmation number',
        'Estimated amount due',
        'Responsible user assignment',
      ]}
      userActions={[
        'View all upcoming tax obligations',
        'Navigate to return preparation via quick link',
        'Mark obligation as completed',
        'View overdue obligations and risk',
        'Filter by tax type or date range',
      ]}
    />
  )
}

