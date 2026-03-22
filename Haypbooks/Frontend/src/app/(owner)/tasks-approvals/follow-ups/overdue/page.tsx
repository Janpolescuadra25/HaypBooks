'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Overdue Follow-ups"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Follow-ups / Overdue"
      purpose="Overdue Follow-ups shows all follow-up actions whose scheduled date has passed without being completed or rescheduled. These represent missed customer contacts, unreturned calls, unpursued payment collections, or unfinished vendor negotiations. The page is sorted by days overdue to help users prioritize which follow-ups are most urgent."
      components={[
        { name: 'Overdue List', description: 'All overdue follow-ups sorted by days overdue descending, with linked record and urgency badge.' },
        { name: 'Quick Actions', description: 'Inline action buttons: Complete, Reschedule (+7 days, +14 days, Custom date), Dismiss.' },
        { name: 'Overdue Summary', description: 'Total count of overdue follow-ups and average days overdue.' },
      ]}
      tabs={['All Overdue', 'Customers', 'Vendors', 'Internal']}
      features={[
        'Captures all missed follow-ups in one view',
        'Quick reschedule without opening detail',
        'One-click navigate to linked record',
        'Bulk reschedule multiple follow-ups',
        'Email digest notification for daily overdue summary',
      ]}
      dataDisplayed={[
        'Follow-up title and linked record type',
        'Original scheduled date and days overdue',
        'Assigned to',
        'Linked record (customer / vendor / invoice reference)',
      ]}
      userActions={[
        'Complete an overdue follow-up',
        'Reschedule to new date (quick +7/+14 or custom)',
        'Dismiss with reason',
        'Navigate to linked record to take action',
        'Bulk select and reschedule multiple follow-ups',
      ]}
      relatedPages={[
        { label: 'Scheduled Follow-ups', href: '/tasks-approvals/follow-ups/scheduled' },
        { label: 'Overdue Items', href: '/tasks-approvals/my-work/overdue-items' },
        { label: 'Collections Center', href: '/sales/collections/collections-center' },
      ]}
    />
  )
}

