'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Scheduled Follow-ups"
      module="TASKS"
      breadcrumb="Tasks & Approvals / Follow-ups / Scheduled"
      purpose="Scheduled Follow-ups manages all future follow-up actions that have been queued for a specific date. Follow-ups are created when users want to revisit a record or action at a future time — such as following up with a customer about a payment in 7 days, or checking on a pending PO in 14 days. They appear as reminders in the user's task feed on the scheduled date."
      components={[
        { name: 'Follow-up List', description: 'Upcoming follow-ups sorted by scheduled date with linked record, reminder note, and days until due.' },
        { name: 'Create Follow-up Form', description: 'Schedule a new follow-up with date, linked record (customer/vendor/invoice), reminder text, and assignee.' },
        { name: 'Calendar Preview', description: 'Mini calendar showing which dates have follow-ups scheduled.' },
        { name: 'Follow-up Templates', description: 'Common follow-up templates: "Payment follow-up in 7 days", "PO status check in 5 days".' },
      ]}
      tabs={['All Scheduled', 'This Week', 'Next Week', 'This Month']}
      features={[
        'Future-date reminder system for any record type',
        'Assignable to any team member',
        'Pre-built follow-up templates for common scenarios',
        'Email reminder on follow-up due date',
        'Snooze: reschedule to new date from notification',
      ]}
      dataDisplayed={[
        'Follow-up title and linked record',
        'Scheduled date and days remaining',
        'Assigned to',
        'Reminder/note text',
        'Created by and creation date',
      ]}
      userActions={[
        'Create a new scheduled follow-up',
        'Edit the scheduled date or note',
        'Mark follow-up as completed',
        'Reschedule (snooze) to a later date',
        'Reassign to another team member',
        'Delete a follow-up no longer needed',
      ]}
      relatedPages={[
        { label: 'Overdue Follow-ups', href: '/tasks-approvals/follow-ups/overdue' },
        { label: 'Completed Follow-ups', href: '/tasks-approvals/follow-ups/completed' },
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
      ]}
    />
  )
}

