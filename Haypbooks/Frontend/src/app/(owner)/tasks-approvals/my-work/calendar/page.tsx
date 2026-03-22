'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Calendar"
      module="TASKS"
      breadcrumb="Tasks & Approvals / My Work / Calendar"
      purpose="The Calendar page provides a unified calendar view aggregating all time-sensitive items for the logged-in user: task due dates, approval deadlines, scheduled follow-ups, tax filing deadlines, payroll run dates, and meeting reminders. It helps users visualize and manage their workload over time with week, month, and agenda views."
      components={[
        { name: 'Calendar Grid', description: 'Month/week/day calendar grid with color-coded event types. Click a day to see all items due on that date.' },
        { name: 'Agenda List View', description: 'Rolling list of upcoming items by date for users who prefer a list over grid view.' },
        { name: 'Event Type Legend', description: 'Color-coded legend: Tasks (emerald), Approvals (amber), Tax Deadlines (red), Payroll (blue), Follow-ups (purple).' },
        { name: 'Add Event Button', description: 'Create reminders or tasks directly from the calendar with date pre-filled.' },
        { name: 'Calendar Filters', description: 'Toggle which event types to show/hide on the calendar.' },
      ]}
      tabs={['Month', 'Week', 'Day', 'Agenda']}
      features={[
        'Aggregates due dates from all modules',
        'Color coding by event type for quick scanning',
        'Click events to navigate to source record',
        'Create tasks and reminders directly from calendar',
        'Export calendar as ICS for Google/Outlook sync',
        'Tax deadline integration from Tax Calendar',
      ]}
      dataDisplayed={[
        'Task due dates with priority indicator',
        'Approval request expiry dates',
        'Tax filing deadlines from all jurisdictions',
        'Scheduled payroll run dates',
        'Follow-up reminder dates',
        'Custom reminders created by user',
      ]}
      userActions={[
        'Navigate between month/week/day views',
        'Click an event to view linked record detail',
        'Create a new task or reminder from calendar',
        'Toggle event type visibility filters',
        'Export calendar as ICS file',
        'Share calendar view as a link',
      ]}
      relatedPages={[
        { label: 'My Tasks', href: '/tasks-approvals/my-work/my-tasks' },
        { label: 'Tax Calendar', href: '/taxes/tax-center/tax-calendar' },
        { label: 'Filing Calendar', href: '/organization/governance/filing-calendar' },
        { label: 'Holiday Calendar', href: '/payroll-workforce/time-leave/holiday-calendar' },
      ]}
    />
  )
}

