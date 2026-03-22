'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function TimerPage() {
  return (
    <PageDocumentation
      title="Timer"
      module="TIME"
      breadcrumb="Time / Entry / Timer"
      purpose="The Timer provides a real-time stopwatch for employees to track time accurately as they work, eliminating the guesswork of retrospective time entry. Users start, pause, and stop the timer while tagging it to a project and task before saving it as a time entry. The timer persists across browser sessions so accidental page refreshes do not result in lost time tracking."
      components={[
        { name: 'Live Stopwatch Display', description: 'Large digital timer showing elapsed hours:minutes:seconds with start, pause, and stop controls.' },
        { name: 'Project & Task Selector', description: 'Dropdowns to tag the active timer to a specific project and task before saving.' },
        { name: 'Description Field', description: 'Text input to add a work description or note that will populate the time entry log.' },
        { name: 'Recent Timers List', description: 'History of past timer sessions for the current day, with one-click restart capability.' },
        { name: 'Manual Time Override', description: "Option to manually adjust the timer's elapsed time before saving to correct for start delays." },
      ]}
      tabs={['Active Timer', "Today's Entries", 'Recent History']}
      features={[
        'Start, pause, and stop a live timer for accurate real-time tracking',
        'Tag running timer to project and task before saving',
        'Timer persists across page reloads to prevent data loss',
        'Add work description to populate the time entry description',
        'Restart a past timer entry with one click',
        'Manually adjust recorded time before submitting the entry',
      ]}
      dataDisplayed={[
        'Current elapsed time (live updating)',
        'Selected project and task',
        'Work description draft',
        "Today's time entries list with total hours",
        'Recent 7-day timer history',
      ]}
      userActions={[
        'Start, pause, or stop the timer',
        'Assign timer to a project and task',
        'Add or update work description',
        'Save timer as a completed time entry',
        'Restart a past timer entry',
      ]}
    />
  )
}

