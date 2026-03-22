'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TimesheetsPage() {
  return (
    <PageDocumentation
      title="Timesheets"
      module="TIME"
      breadcrumb="Time / Entry / Timesheets"
      purpose="Timesheets presents a weekly grid interface for employees to log their time entries day-by-day across multiple projects, mirroring the familiar spreadsheet-style timesheet format used in professional services. The weekly view allows bulk entry and submission, making it more efficient for employees who prefer to log time at the end of each day or week rather than using the live timer. Submitted timesheets go to a manager review workflow."
      components={[
        { name: 'Weekly Grid', description: 'Matrix with project/task rows and weekday columns where hours can be entered for each combination.' },
        { name: 'Period Navigator', description: 'Previous/next week arrows with a date picker to navigate to any timesheet week.' },
        { name: 'Add Row', description: 'Button to add a new project-task row to the timesheet for a new category of work.' },
        { name: 'Totals Summary Bar', description: 'Footer row showing daily and weekly totals with color indicator for under/over expected hours.' },
        { name: 'Submit Timesheet Button', description: 'Submit the completed week for manager approval, locking entries from further editing.' },
      ]}
      tabs={['Current Week', 'Past Weeks', 'All Timesheets']}
      features={[
        'Enter time in a weekly grid format by project and task',
        'Navigate between weeks with period navigator',
        'See daily and weekly hour totals automatically calculated',
        'Submit completed week for manager approval',
        "Copy last week's project rows to speed up repetitive entry",
        'View approval status and comments from manager',
      ]}
      dataDisplayed={[
        'Project and task rows with daily hour cells',
        'Daily and weekly totals',
        'Submission and approval status',
        'Manager comments on rejected timesheets',
        'Completion rate vs. expected working hours',
      ]}
      userActions={[
        'Log hours per project/task per day',
        'Add new project-task rows',
        'Submit week for manager approval',
        'Copy previous week rows for quick entry',
        'Navigate to any past timesheet week',
      ]}
    />
  )
}

