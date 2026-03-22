'use client'

import PageDocumentation from '@/components/owner/PageDocumentation'

export default function Page() {
  return (
    <PageDocumentation
      title="Recurring Templates Hub"
      module="AUTOMATION"
      breadcrumb="Automation / Scheduling / Recurring Templates Hub"
      purpose="Central hub for all recurring transactions including invoices, bills, and journal entries. View next execution dates, pause or resume templates, and review execution history."
      components={[
        { name: "Templates Overview", description: "Summary cards showing count of active recurring invoices, bills, and entries" },
        { name: "Template List Table", description: "All recurring templates with type, frequency, next run date, and status" },
        { name: "Template Detail Panel", description: "Full recurring template configuration with schedule and history" },
        { name: "Pause/Resume Controls", description: "Toggle active state of any template" },
        { name: "Execution History", description: "Log of all past executions for each template with created record links" },
      ]}
      tabs={["All Templates","Invoices","Bills","Journal Entries","Paused"]}
      features={["Unified view of all recurring types","Next run date visibility","Pause and resume controls","Execution history with links","Frequency and end-date configuration"]}
      dataDisplayed={["Template name and type (invoice/bill/entry)","Recurrence frequency","Next scheduled run date","Last execution date","Total executions count"]}
      userActions={["View template details","Pause recurring template","Resume paused template","Edit template schedule","View execution history"]}
    />
  )
}

